import { normalizeEmail, RecoveryFailureCode } from "@/lib/auth/recovery-audit"
import { generateOtp, hashRecoverySecret } from "@/lib/auth/recovery-crypto"
import { prisma } from "@/lib/prisma"
import { recordAccountRecoveryAudit } from "./account-recovery-audit-service"
import { enqueueAuthEmail } from "./auth-email-job-service"
import { TTL, identifier } from "./admin-password-recovery-service"

export type AdminPasswordResetEligibility = "accepted" | "not_found" | "disabled" | "scope_mismatch"

export async function getAdminPasswordResetEligibility(rawEmail: string): Promise<{ email: string; status: AdminPasswordResetEligibility }> {
  const email = normalizeEmail(rawEmail)
  const admin = await prisma.adminUser.findUnique({ where: { email }, select: { isActive: true, userId: true } })
  if (!admin) return { email, status: "not_found" }
  if (!admin.isActive) return { email, status: "disabled" }

  const user = admin.userId
    ? await prisma.user.findUnique({ where: { id: admin.userId }, select: { id: true } })
    : await prisma.user.findUnique({ where: { email }, select: { id: true } })
  return { email, status: user ? "accepted" : "scope_mismatch" }
}

export async function requestAdminPasswordReset(input: { email: string; ipAddress?: string | null }) {
  const secret = process.env.AUTH_RECOVERY_HMAC_SECRET || process.env.BETTER_AUTH_SECRET
  if (!secret) return
  const eligibility = await getAdminPasswordResetEligibility(input.email)
  const { email } = eligibility
  if (eligibility.status === "not_found") return reject(input, email, secret, RecoveryFailureCode.ACCOUNT_NOT_FOUND)
  if (eligibility.status === "disabled") return reject(input, email, secret, RecoveryFailureCode.ACCOUNT_DISABLED)
  if (eligibility.status === "scope_mismatch") return reject(input, email, secret, RecoveryFailureCode.ACCOUNT_SCOPE_MISMATCH)
  const otp = generateOtp()
  const expiresAt = new Date(Date.now() + TTL)
  await enqueueAuthEmail({
    email, otp,
    subject: "SoloSales 管理员密码重置验证码",
    text: "您的管理员密码重置验证码是 " + otp + "，5 分钟内有效。",
    verificationJson: JSON.stringify({ id: identifier(email, secret), identifier: "password-reset:admin", value: hashRecoverySecret(otp, secret) + ":0", expiresAt: expiresAt.toISOString() }),
  })
  await recordAccountRecoveryAudit({ db: prisma, event: { scope: "ADMIN_PASSWORD_RESET", result: "ACCEPTED", email, ipAddress: input.ipAddress, hmacSecret: secret } })
}

async function reject(input: { ipAddress?: string | null }, email: string, hmacSecret: string, failureCode: RecoveryFailureCode) {
  await recordAccountRecoveryAudit({ db: prisma, event: { scope: "ADMIN_PASSWORD_RESET", result: "REJECTED", failureCode, email, ipAddress: input.ipAddress, hmacSecret } })
}
