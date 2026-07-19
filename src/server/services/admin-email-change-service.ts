import { randomUUID } from "node:crypto"
import { normalizeEmail, RecoveryFailureCode } from "@/lib/auth/recovery-audit"
import { decryptRecoveryPayload, encryptRecoveryPayload, generateOtp, hashRecoverySecret, verifyRecoverySecret } from "@/lib/auth/recovery-crypto"
import { prisma } from "@/lib/prisma"
import { enqueueAuthEmailBatch } from "./auth-email-job-service"
import { recordAccountRecoveryAudit } from "./account-recovery-audit-service"

const TTL = 5 * 60 * 1000
const LIMIT = 3

function secret() { const value = process.env.AUTH_RECOVERY_HMAC_SECRET || process.env.BETTER_AUTH_SECRET; if (!value) throw new Error("AUTH_RECOVERY_HMAC_SECRET is required"); return value }
function keyring() { const key = process.env.AUTH_RECOVERY_ENCRYPTION_KEY; if (!key) throw new Error("AUTH_RECOVERY_ENCRYPTION_KEY is required"); const keyId = process.env.AUTH_RECOVERY_ENCRYPTION_KEY_ID || "current"; return { activeKeyId: keyId, keys: { [keyId]: key } } }

export async function requestAdminEmailChange(input: { adminId: string; email: string; newEmail: string; ipAddress?: string | null }) {
  const nextEmail = normalizeEmail(input.newEmail)
  const hmacSecret = secret()
  if (!nextEmail || nextEmail === normalizeEmail(input.email)) return false
  const [userCollision, adminCollision] = await Promise.all([prisma.user.findUnique({ where: { email: nextEmail }, select: { id: true } }), prisma.adminUser.findUnique({ where: { email: nextEmail }, select: { id: true } })])
  if (userCollision || adminCollision) return false
  const oldOtp = generateOtp(); const newOtp = generateOtp(); const expiresAt = new Date(Date.now() + TTL); const id = `admin-email-change:${randomUUID()}`
  const value = JSON.stringify(encryptRecoveryPayload({ adminId: input.adminId, newEmail: nextEmail, oldOtpHash: hashRecoverySecret(oldOtp, hmacSecret), newOtpHash: hashRecoverySecret(newOtp, hmacSecret), attempts: "0" }, keyring()))
  await enqueueAuthEmailBatch({ messages: [
    { email: input.email, otp: oldOtp, subject: "SoloSales 管理员邮箱变更验证码", text: `确认邮箱变更验证码：${oldOtp}，5 分钟内有效。` },
    { email: nextEmail, otp: newOtp, subject: "SoloSales 管理员邮箱变更验证码", text: `确认新邮箱验证码：${newOtp}，5 分钟内有效。` },
  ], verificationJson: JSON.stringify({ id, identifier: "admin-email-change", value, expiresAt: expiresAt.toISOString() }) })
  await recordAccountRecoveryAudit({ db: prisma, event: { scope: "ADMIN_EMAIL_CHANGE", result: "ACCEPTED", email: input.email, ipAddress: input.ipAddress, hmacSecret } })
  return id
}

export async function confirmAdminEmailChange(input: { adminId: string; email: string; operationId: string; oldOtp: string; newOtp: string; ipAddress?: string | null }) {
  const hmacSecret = secret(); const verification = await prisma.verification.findUnique({ where: { id: input.operationId } })
  if (!verification || verification.identifier !== "admin-email-change" || verification.expiresAt <= new Date()) return false
  const payload = decryptRecoveryPayload(JSON.parse(verification.value), keyring())
  const attempts = Number(payload.attempts || "0")
  if (payload.adminId !== input.adminId || attempts >= LIMIT || !verifyRecoverySecret(input.oldOtp, payload.oldOtpHash, hmacSecret) || !verifyRecoverySecret(input.newOtp, payload.newOtpHash, hmacSecret)) {
    await prisma.verification.update({ where: { id: verification.id }, data: { value: JSON.stringify(encryptRecoveryPayload({ ...payload, attempts: String(attempts + 1) }, keyring())) } })
    return false
  }
  const result = await prisma.$transaction(async (tx) => {
    const admin = await tx.adminUser.findUnique({ where: { id: input.adminId }, select: { userId: true } })
    if (!admin?.userId) return false
    const [collision, adminCollision] = await Promise.all([
      tx.user.findUnique({ where: { email: payload.newEmail }, select: { id: true } }),
      tx.adminUser.findUnique({ where: { email: payload.newEmail }, select: { id: true } }),
    ])
    if (collision || adminCollision) return false
    await tx.user.update({ where: { id: admin.userId }, data: { email: payload.newEmail } })
    await tx.adminUser.update({ where: { id: input.adminId }, data: { email: payload.newEmail } })
    await tx.session.deleteMany({ where: { userId: admin.userId } }); await tx.verification.delete({ where: { id: verification.id } })
    return true
  })
  await recordAccountRecoveryAudit({ db: prisma, event: { scope: "ADMIN_EMAIL_CHANGE", result: result ? "ACCEPTED" : "REJECTED", failureCode: result ? undefined : RecoveryFailureCode.ACCOUNT_SCOPE_MISMATCH, email: input.email, ipAddress: input.ipAddress, hmacSecret } })
  return result
}
