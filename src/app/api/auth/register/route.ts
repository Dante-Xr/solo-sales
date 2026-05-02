/**
 * 修改时间：2026-05-02 20:52:58 +08:00
 * 修改内容：统一用户注册路由响应与错误处理，保留注册限流和邮箱冲突提示。
 * 修改模型：gpt-5.5
 *
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

import { registerRateLimiter } from "@/middleware/rate-limit"
import { registerSchema, parseWithValidation } from "@/lib/validators"
import { conflict, internalError, validationError } from "@/server/contracts/errors"
import { errorResponse, handleApiError, successResponse } from "@/server/contracts/api"

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
  if (!rateLimitResult.allowed) {
    // 注册限流同样走标准错误响应，避免同一路由出现两种错误体格式。
    return errorResponse(
      { code: "TOO_MANY_REQUESTS", message: "请求过于频繁，请稍后再试" },
      429,
      { headers: rateLimitResult.headers }
    )
  }

  try {
    const body = await request.json()

    const validation = parseWithValidation(registerSchema, body)
    if (!validation.success) {
      throw validationError(validation.errors[0].message, validation.errors[0])
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
      throw internalError("注册失败，请稍后重试")
    }

    // 对外只返回注册后前端需要展示的基础身份信息，不暴露 Better Auth 内部结果。
    return successResponse({
      id: (result as { user?: { id?: string } }).user?.id,
      email,
      name,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "注册失败"
    if (message.includes("already") || message.includes("exist")) {
      return handleApiError(conflict("该邮箱已被注册"))
    }
    return handleApiError(error)
  }
}
