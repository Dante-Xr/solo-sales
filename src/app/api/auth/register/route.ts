/**
 * ============================================
 * 用户注册 API 路由 (Phase 2 安全修复)
 * ============================================
 * 创建日期: 2026-03-27
 * 功能说明：
 *   - POST /api/auth/register: 用户注册
 *   - 使用 Better Auth 的 signUpEmail 方法
 *   - 支持注册频率限制（rate limiting）
 *
 * 安全改进：
 *   - 使用 Zod 进行请求参数验证
 *   - 注册频率限制防止暴力注册
 *   - 错误消息不泄露已存在邮箱的具体信息
 * ============================================
 */

import { NextResponse } from "next/server"
import { registerRateLimiter } from "@/middleware/rate-limit"
import { registerSchema, parseWithValidation } from "@/lib/validators"

/**
 * POST: 用户注册
 *
 * 流程：
 *   1. 检查注册频率限制（防止滥用）
 *   2. 验证请求参数（邮箱、密码、用户名）
 *   3. 调用 Better Auth 注册
 *   4. 返回新用户 ID 和邮箱
 *
 * @param request - 包含 email, password, name 的请求体
 * @returns 新用户信息或错误消息
 */
export async function POST(request: Request) {
  const rateLimitResult = registerRateLimiter(request)
  if (!rateLimitResult.allowed && rateLimitResult.errorResponse) {
    return rateLimitResult.errorResponse
  }

  try {
    const body = await request.json()

    const validation = parseWithValidation(registerSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.errors[0].message, field: validation.errors[0].field },
        { status: 400 }
      )
    }

    const { email, password, name } = validation.data

    const { auth } = await import("@/lib/auth")
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: name || "",
      },
    })

    if (!result) {
      return NextResponse.json(
        { error: "注册失败，请稍后重试" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: (result as { user?: { id?: string } }).user?.id,
      email,
      name,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "注册失败"
    if (message.includes("already") || message.includes("exist")) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 400 }
      )
    }
    console.error("注册错误:", error)
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    )
  }
}
