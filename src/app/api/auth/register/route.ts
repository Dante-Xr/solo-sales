import { NextResponse } from "next/server"
import { registerRateLimiter } from "@/middleware/rate-limit"
import { registerSchema, parseWithValidation } from "@/lib/validators"

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
