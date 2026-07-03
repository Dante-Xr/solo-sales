/**
 * 修改时间：2026-05-02 21:14:38 +08:00
 * 修改内容：统一 CSRF Token 路由响应与错误处理，同时保留顶层 token 兼容现有 Hook。
 * 修改模型：gpt-5.5
 *
 * CSRF Token API
 * GET /api/csrf-token：生成新的 CSRF Token 并设置到 cookie 中返回
 */

import { generateCsrfToken, CSRF_COOKIE_NAME } from "@/lib/csrf"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { internalError } from "@/server/contracts/errors"

export async function GET() {
  try {
    const token = await generateCsrfToken()

    const response = successResponse(
      { token },
      {
        // 保留顶层 token，避免 useCsrfToken 和第三方脚本在迁移期读取失败。
        topLevel: { token },
      }
    )

    const isProduction = process.env.NODE_ENV === "production"
    response.cookies.set(CSRF_COOKIE_NAME, token, {
      httpOnly: false,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60,
    })

    return response
  } catch (error: unknown) {
    return handleApiError(internalError("生成 CSRF Token 失败", error))
  }
}
