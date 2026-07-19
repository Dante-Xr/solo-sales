import { NextRequest, NextResponse } from "next/server"
import { confirmAdminPasswordReset } from "@/server/services/admin-password-recovery-service"

function ip(request: NextRequest) { return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: unknown; otp?: unknown; password?: unknown }
    if (typeof body.email === "string" && typeof body.otp === "string" && typeof body.password === "string") {
      const success = await confirmAdminPasswordReset({ email: body.email, otp: body.otp, password: body.password, ipAddress: ip(request) })
      if (success) return NextResponse.json({ success: true })
    }
  } catch {}
  return NextResponse.json({ message: "验证码无效或已过期" }, { status: 400 })
}
