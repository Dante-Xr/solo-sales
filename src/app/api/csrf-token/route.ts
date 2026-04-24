/**
 * CSRF Token API
 * GET /api/csrf-token：生成新的 CSRF Token 并设置到 cookie 中返回
 */

import { NextResponse } from "next/server"
import { generateCsrfToken, CSRF_COOKIE_NAME } from "@/lib/csrf"

export async function GET() {
  try {
    const token = await generateCsrfToken()

    const response = NextResponse.json({ token })

    const isProduction = process.env.NODE_ENV === "production"
    response.cookies.set(CSRF_COOKIE_NAME, token, {
      httpOnly: false,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60,
    })

    return response
  } catch (error) {
    console.error("生成 CSRF Token 失败:", error)
    return NextResponse.json(
      { error: "生成 CSRF Token 失败" },
      { status: 500 }
    )
  }
}
