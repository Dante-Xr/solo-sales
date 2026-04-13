import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_PATHS = [
  "/admin/login",
  "/api/admin/auth",
  "/api/auth",
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin")) {
    const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
    if (!isPublicPath) {
      const sessionToken = request.cookies.get("better-auth.session_token")?.value
      if (!sessionToken) {
        const loginUrl = new URL("/admin/login", request.url)
        loginUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
}
