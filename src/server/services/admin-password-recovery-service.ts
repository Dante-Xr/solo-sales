import { randomUUID } from "node:crypto"
import { auth } from "@/lib/auth"
import { normalizeEmail, RecoveryFailureCode } from "@/lib/auth/recovery-audit"
import { hashRecoverySecret, verifyRecoverySecret } from "@/lib/auth/recovery-crypto"
import { validatePassword } from "@/lib/auth/password-policy"
import { prisma } from "@/lib/prisma"
import { recordAccountRecoveryAudit } from "./account-recovery-audit-service"

const TTL = 5 * 60 * 1000
const LIMIT = 3

export async function confirmAdminPasswordReset(input: { email: string; otp: string; password: string; ipAddress?: string | null }) {
  const email = normalizeEmail(input.email)
  const secret = hmacSecret()
  const admin = await prisma.adminUser.findUnique({ where: { email }, select: { isActive: true, userId: true } })
  if (!admin) return reject(input, email, secret, RecoveryFailureCode.ACCOUNT_NOT_FOUND)
  if (!admin.isActive) return reject(input, email, secret, RecoveryFailureCode.ACCOUNT_DISABLED)
  const user = admin.userId ? await prisma.user.findUnique({ where: { id: admin.userId }, select: { id: true } }) : await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (!user || !validatePassword(input.password).valid) return false
  const verification = await prisma.verification.findUnique({ where: { id: identifier(email, secret) } })
  if (!verification || verification.expiresAt <= new Date()) return reject(input, email, secret, RecoveryFailureCode.OTP_EXPIRED)
  const [hash, rawAttempts] = verification.value.split(":")
  const attempts = Number(rawAttempts)
  if (attempts >= LIMIT) return reject(input, email, secret, RecoveryFailureCode.OTP_ATTEMPTS_EXHAUSTED)
  if (!verifyRecoverySecret(input.otp, hash, secret)) {
    await prisma.verification.update({ where: { id: verification.id }, data: { value: `${hash}:${attempts + 1}` } })
    return reject(input, email, secret, RecoveryFailureCode.OTP_INVALID)
  }
  await prisma.verification.delete({ where: { id: verification.id } })
  const token = randomUUID()
  await prisma.verification.create({ data: { id: `reset-password:${token}`, identifier: "password-reset:admin", value: user.id, expiresAt: new Date(Date.now() + 60_000) } })
  try { await auth.api.resetPassword({ body: { token, newPassword: input.password } }) } catch { return reject(input, email, secret, RecoveryFailureCode.DEPENDENCY_UNAVAILABLE) }
  await recordAccountRecoveryAudit({ db: prisma, event: { scope: "ADMIN_PASSWORD_RESET", result: "ACCEPTED", email, ipAddress: input.ipAddress, hmacSecret: secret } })
  return true
}

function identifier(email: string, secret: string) { return `password-reset:admin:${hashRecoverySecret(email, secret)}` }
function hmacSecret() { const secret = process.env.AUTH_RECOVERY_HMAC_SECRET || process.env.BETTER_AUTH_SECRET; if (!secret) throw new Error("AUTH_RECOVERY_HMAC_SECRET is required"); return secret }
async function reject(input: { ipAddress?: string | null }, email: string, hmacSecret: string, failureCode: RecoveryFailureCode) {
  await recordAccountRecoveryAudit({ db: prisma, event: { scope: "ADMIN_PASSWORD_RESET", result: "REJECTED", failureCode, email, ipAddress: input.ipAddress, hmacSecret } })
  return false
}

export { TTL, identifier }
