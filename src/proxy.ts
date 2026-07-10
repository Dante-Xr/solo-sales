/**
 * ============================================
 * Next.js 16 Proxy 配置文件 (Phase 4 & Phase 5)
 * ============================================
 * 创建日期: 2026-04-13
 * 创建时间: 19:15
 * 功能说明：
 *   - 使用 next-intl createMiddleware 处理语言路由
 *   - 处理管理员认证
 *   - Next.js 16 中 middleware 已改名为 proxy
 * ============================================
 * 2026-04-14 00:20: 修复重定向循环，使用 next-intl createMiddleware
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

const PUBLIC_PATHS = [
  "/admin/login",
  "/api/admin/auth",
  "/api/auth",
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. 先执行 next-intl 的语言检测和重定向
  const response = intlMiddleware(request)

  // 2. 生成 CSP nonce 并注入响应头（暂时注释掉以调试502问题）
  // const nonce = generateNonce()
  // const isDev = process.env.NODE_ENV === "development"
  // response.headers.set("Content-Security-Policy", getCspHeaders(nonce, isDev))
  // response.headers.set("x-nonce", nonce)

  // 3. 安全响应头
  response.headers.set("X-DNS-Prefetch-Control", "on")
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  // 4. 管理员认证检查
  if (pathname.includes("/admin")) {
    const isPublicPath = PUBLIC_PATHS.some((p) => pathname.includes(p))
    if (!isPublicPath) {
      const sessionToken = request.cookies.get("better-auth.session_token")?.value
      if (!sessionToken) {
        const localeMatch = pathname.match(/^\/(zh|en)/)
        const currentLocale = localeMatch ? localeMatch[1] : routing.defaultLocale
        const loginUrl = new URL(`/${currentLocale}/admin/login`, request.url)
        loginUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/(zh|en)/:path*',
  ],
}
