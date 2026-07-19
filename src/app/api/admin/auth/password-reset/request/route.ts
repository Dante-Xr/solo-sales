import { NextRequest, NextResponse } from "next/server"
import { getAdminPasswordResetEligibility, requestAdminPasswordReset } from "@/server/services/admin-password-reset-request-service"
import { enforceRecoveryRequestRateLimit } from "@/lib/auth/recovery-rate-limit"

function ip(request: NextRequest) { return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: unknown }
    if (typeof body.email !== "string") {
      return NextResponse.json({ message: "请输入管理员邮箱" }, { status: 400 })
    }

    const email = body.email.trim().toLowerCase()
    const eligibility = await getAdminPasswordResetEligibility(email)
    if (eligibility.status !== "accepted") {
      // Reuse the request service so rejected attempts are persisted in the recovery audit log.
      await requestAdminPasswordReset({ email, ipAddress: ip(request) })
      const message = eligibility.status === "not_found"
        ? "未找到此管理员邮箱"
        : "该管理员账号不可用于密码重置"
      return NextResponse.json({ message }, { status: 400 })
    }

    const hmacSecret = process.env.AUTH_RECOVERY_HMAC_SECRET || process.env.BETTER_AUTH_SECRET || ""
    await enforceRecoveryRequestRateLimit({ scope: "admin", email, ipAddress: ip(request), hmacSecret })
    await requestAdminPasswordReset({ email, ipAddress: ip(request) })
    return NextResponse.json({ accepted: true }, { status: 202 })
  } catch {
    return NextResponse.json({ message: "发送验证码失败，请稍后重试" }, { status: 503 })
  }
}
