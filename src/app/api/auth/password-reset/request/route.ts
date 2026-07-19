import { NextRequest, NextResponse } from "next/server"
import { requestUserPasswordReset } from "@/server/services/password-recovery-service"
import { enforceRecoveryRequestRateLimit } from "@/lib/auth/recovery-rate-limit"

function requestIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: unknown }
    if (typeof body.email === "string") {
      const hmacSecret = process.env.AUTH_RECOVERY_HMAC_SECRET || process.env.BETTER_AUTH_SECRET || ""
      await enforceRecoveryRequestRateLimit({ scope: "user", email: body.email.trim().toLowerCase(), ipAddress: requestIp(request), hmacSecret })
      await requestUserPasswordReset({ email: body.email, ipAddress: requestIp(request) })
    }
  } catch {
    // Public responses intentionally do not reveal account or delivery state.
  }

  return NextResponse.json({ accepted: true }, { status: 202 })
}
