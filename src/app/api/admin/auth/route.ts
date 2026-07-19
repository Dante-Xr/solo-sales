/**
 * 修改时间：2026-05-02 21:02:01 +08:00
 * 修改内容：统一管理员登录、登出和当前管理员查询路由响应与错误处理。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 管理员认证 API 路由 (Phase 2 安全修复)
 * ============================================
 * 功能说明：
 *   - POST /api/admin/auth: 管理员登录
 *   - PUT /api/admin/auth: 管理员登出
 *   - GET /api/admin/auth: 获取当前管理员信息
 *
 * 安全改进：
 *   - 之前使用 Base64 伪造 Token，可被轻易篡改
 *   - 现在使用 Better Auth Session Cookie（HMAC 签名）
 *   - 会话存储在数据库中，支持即时撤销
 * ============================================
 */

import { NextRequest } from "next/server"
import { LogAction, TargetType } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { normalizeIdentityEmail } from "@/lib/auth/admin-identity-migration"
import { headers } from "next/headers"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest, internalError, unauthorized } from "@/server/contracts/errors"
import { adminLoginRateLimiter } from "@/middleware/rate-limit"

/** Better Auth Session Cookie 名称 */
const SESSION_COOKIE_NAME = "better-auth.session_token"
function isProductionRuntime() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production" || process.env.NETLIFY === "true"
}

function requestAuditMeta(request: NextRequest) {
  return {
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? null,
    userAgent: request.headers.get("user-agent"),
  }
}

async function auditAdminLogin(
  request: NextRequest,
  adminId: string,
  event: "ADMIN_LOGIN_SUCCESS" | "ADMIN_LOGIN_FAILED",
  reason?: string
) {
  try {
    const { ipAddress, userAgent } = requestAuditMeta(request)
    await prisma.permissionLog.create({
      data: {
        action: LogAction.UPDATE,
        targetType: TargetType.ADMIN_USER,
        targetId: adminId,
        operatorId: adminId,
        afterData: {
          event,
          reason,
        },
        ipAddress,
        userAgent,
      },
    })
  } catch {
    // 登录审计失败不能改变认证响应，但生产告警应通过日志采集发现。
  }
}

function adminSessionPayload(admin: {
  id: string
  username: string
  email: string
  role: { id: string; name: string; label: string }
}) {
  return {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    role: {
      id: admin.role.id,
      name: admin.role.name,
      label: admin.role.label,
    },
  }
}

/**
 * POST: 管理员登录
 *
 * 登录流程：
 *   1. 验证已迁移的管理员身份
 *   2. 委托 Better Auth 校验 Account 中唯一凭据并创建会话
 *   3. 更新最后登录时间与审计记录
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = adminLoginRateLimiter(request)
    if (!rateLimitResult.allowed && rateLimitResult.errorResponse) {
      return rateLimitResult.errorResponse
    }

    const body = await request.json()
    const { email, password } = body

    // 验证必填字段
    if (!email || !password) {
      throw badRequest("邮箱和密码不能为空")
    }

    // 查询管理员记录（包含角色信息）
    const normalizedEmail = normalizeIdentityEmail(email)
    const admin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    })

    // 管理员不存在
    if (!admin) {
      throw unauthorized("邮箱或密码错误")
    }

    // 管理员已被禁用
    if (!admin.isActive) {
      throw unauthorized("账号已被禁用")
    }

    if (!admin.userId) {
      await auditAdminLogin(request, admin.id, "ADMIN_LOGIN_FAILED", "IDENTITY_MIGRATION_REQUIRED")
      throw unauthorized("邮箱或密码错误")
    }

    // 更新最后登录时间
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    })

    let signInHeaders: Headers | undefined
    try {
      const signInResult = await auth.api.signInEmail({
        body: {
          email: normalizedEmail,
          password: password,
        },
        headers: request.headers,
        returnHeaders: true,
      })
      signInHeaders = signInResult.headers
    } catch (error) {
      await auditAdminLogin(request, admin.id, "ADMIN_LOGIN_FAILED", "INVALID_PASSWORD_OR_AUTH_FAILURE")
      if (isProductionRuntime() && !isCredentialFailure(error)) {
        throw internalError("登录失败，请稍后重试", "Better Auth sign-in failed")
      }
      throw unauthorized("邮箱或密码错误")
    }

    // Better Auth 登录成功
    await auditAdminLogin(request, admin.id, "ADMIN_LOGIN_SUCCESS")
    return successResponse(adminSessionPayload(admin), { headers: signInHeaders })
  } catch (error: unknown) {
    return handleApiError(
      error instanceof Error && error.name !== "AppError"
        ? internalError("登录失败，请稍后重试", error.message)
        : error
    )
  }
}

function isCredentialFailure(error: unknown) {
  const status = typeof error === "object" && error !== null && "status" in error ? (error as { status?: unknown }).status : undefined
  return status === 400 || status === 401 || status === 403
}

/**
 * PUT: 管理员登出
 * 清除 Better Auth Session 和本地 Session Cookie
 */
export async function PUT(_request: NextRequest) {
  try {
    // 尝试清除 Better Auth Session
    await auth.api.signOut({
      headers: await headers(),
    })
  } catch {
    // ignore errors
  }

  // 清除本地 Session Cookie
  const response = successResponse({ loggedOut: true }, { meta: { message: "登出成功" } })
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProductionRuntime(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return response
}

/**
 * GET: 获取当前管理员信息
 * 验证 Better Auth Session，返回管理员详情和权限
 */
export async function GET(request: NextRequest) {
  try {
    // 使用 Better Auth 验证会话
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      throw unauthorized("未登录")
    }

    // 查询管理员详细信息
    const admin = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    })

    if (!admin || !admin.isActive) {
      throw unauthorized("账号不存在或已被禁用")
    }

    return successResponse({
      ...adminSessionPayload(admin),
      permissions: admin.role.permissions.map((p) => p.name),
      lastLoginAt: admin.lastLoginAt,
    })
  } catch (error: unknown) {
    return handleApiError(
      error instanceof Error && error.name !== "AppError"
        ? internalError("获取信息失败", error.message)
        : error
    )
  }
}
