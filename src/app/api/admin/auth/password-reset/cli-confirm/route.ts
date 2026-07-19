import { NextRequest, NextResponse } from "next/server"
import { validatePassword } from "@/lib/auth/password-policy"
import { prisma } from "@/lib/prisma"
import { completeCliAdminRecovery } from "@/server/services/cli-admin-recovery-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { token?: unknown; password?: unknown }
    if (typeof body.token !== "string" || typeof body.password !== "string" || !validatePassword(body.password).valid) throw new Error("invalid")
    const hmacSecret = process.env.AUTH_RECOVERY_HMAC_SECRET || process.env.BETTER_AUTH_SECRET
    if (!hmacSecret) throw new Error("invalid")
    const success = await completeCliAdminRecovery({ db: prisma, token: body.token, password: body.password, hmacSecret })
    if (!success) throw new Error("invalid")
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ message: "验证码无效或已过期" }, { status: 400 })
  }
}
