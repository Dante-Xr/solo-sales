import { NextRequest, NextResponse } from "next/server"
import { confirmUserPasswordReset } from "@/server/services/password-recovery-service"

function requestIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: unknown; otp?: unknown; password?: unknown }
    if (typeof body.email !== "string" || typeof body.otp !== "string" || typeof body.password !== "string") {
      return NextResponse.json({ message: "验证码无效或已过期" }, { status: 400 })
    }
    const success = await confirmUserPasswordReset({
      email: body.email,
      otp: body.otp,
      password: body.password,
      ipAddress: requestIp(request),
    })
    if (success) return NextResponse.json({ success: true })
  } catch {
    // Confirmation errors intentionally use the same public result.
  }

  return NextResponse.json({ message: "验证码无效或已过期" }, { status: 400 })
}
