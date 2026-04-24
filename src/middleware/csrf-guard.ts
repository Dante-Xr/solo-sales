/**
 * CSRF 防护中间件
 * 功能：验证 POST/PUT/DELETE/PATCH 请求的 CSRF Token
 */

import { NextResponse } from "next/server"
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME, verifyCsrfToken } from "@/lib/csrf"

export async function csrfGuard(request: Request): Promise<NextResponse | null> {
  const method = request.method.toUpperCase()

  // 跳过安全方法
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return null
  }

  // 从 Cookie 读取 CSRF Token
  const cookieHeader = request.headers.get("cookie") ?? ""
  const cookieToken = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CSRF_COOKIE_NAME}=`))
    ?.split("=").slice(1).join("=") ?? ""

  // 从 Header 读取提交的 Token
  const headerToken = request.headers.get(CSRF_HEADER_NAME) ?? ""

  if (!cookieToken || !headerToken) {
    return NextResponse.json(
      { error: "缺少 CSRF Token" },
      { status: 403 }
    )
  }

  // 验证 header token 有效性
  const isValid = await verifyCsrfToken(headerToken)
  if (!isValid) {
    return NextResponse.json(
      { error: "CSRF Token 已过期或无效" },
      { status: 403 }
    )
  }

  // 对比 cookie 和 header 中的 token
  if (cookieToken !== headerToken) {
    return NextResponse.json(
      { error: "CSRF Token 不匹配" },
      { status: 403 }
    )
  }

  return null
}
