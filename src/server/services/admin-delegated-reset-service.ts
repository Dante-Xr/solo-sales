import { randomUUID } from "node:crypto"
import { RecoveryFailureCode } from "@/lib/auth/recovery-audit"
import { decryptRecoveryPayload, encryptRecoveryPayload, generateOtp, hashRecoverySecret, verifyRecoverySecret } from "@/lib/auth/recovery-crypto"
import { prisma } from "@/lib/prisma"
import { enqueueAuthEmail } from "./auth-email-job-service"
import { requestAdminPasswordReset } from "./admin-password-reset-request-service"
import { recordAccountRecoveryAudit } from "./account-recovery-audit-service"

const TTL = 5 * 60 * 1000

function secret() {
  const value = process.env.AUTH_RECOVERY_HMAC_SECRET || process.env.BETTER_AUTH_SECRET
  if (!value) throw new Error("AUTH_RECOVERY_HMAC_SECRET is required")
  return value
}

function keyring() {
  const key = process.env.AUTH_RECOVERY_ENCRYPTION_KEY
  if (!key) throw new Error("AUTH_RECOVERY_ENCRYPTION_KEY is required")
  const keyId = process.env.AUTH_RECOVERY_ENCRYPTION_KEY_ID || "current"
  return { activeKeyId: keyId, keys: { [keyId]: key } }
}

export async function requestDelegatedAdminReset(input: { operatorId: string; operatorEmail: string; targetAdminId: string; ipAddress?: string | null }) {
  const target = await prisma.adminUser.findUnique({ where: { id: input.targetAdminId }, include: { role: true } })
  if (!target || !target.isActive || target.role.name === "super_admin") {
    await audit(input.operatorEmail, input.ipAddress, RecoveryFailureCode.ACCOUNT_SCOPE_MISMATCH)
    return false
  }
  const otp = generateOtp(); const id = `admin-delegated-reset:${randomUUID()}`
  const payload = JSON.stringify(encryptRecoveryPayload({ operatorId: input.operatorId, targetAdminId: target.id, otpHash: hashRecoverySecret(otp, secret()) }, keyring()))
  await enqueueAuthEmail({ email: input.operatorEmail, otp, subject: "SoloSales 委派密码重置确认", text: `委派重置确认验证码：${otp}，5 分钟内有效。`, verificationJson: JSON.stringify({ id, identifier: "admin-delegated-reset", value: payload, expiresAt: new Date(Date.now() + TTL).toISOString() }) })
  await recordAccountRecoveryAudit({ db: prisma, event: { scope: "ADMIN_DELEGATED_RESET", result: "ACCEPTED", email: input.operatorEmail, ipAddress: input.ipAddress, hmacSecret: secret() } })
  return id
}

export async function confirmDelegatedAdminReset(input: { operatorId: string; targetAdminId: string; operationId: string; otp: string; ipAddress?: string | null }) {
  const verification = await prisma.verification.findUnique({ where: { id: input.operationId } })
  if (!verification || verification.identifier !== "admin-delegated-reset") return false
  if (verification.expiresAt <= new Date()) {
    await audit("unknown", input.ipAddress, RecoveryFailureCode.OTP_EXPIRED)
    return false
  }

  const payload = decryptRecoveryPayload(JSON.parse(verification.value), keyring())
  if (payload.operatorId !== input.operatorId || payload.targetAdminId !== input.targetAdminId || !verifyRecoverySecret(input.otp, payload.otpHash, secret())) {
    await audit("unknown", input.ipAddress, RecoveryFailureCode.OTP_INVALID)
    return false
  }

  const target = await prisma.adminUser.findUnique({ where: { id: payload.targetAdminId }, include: { role: true } })
  if (!target || !target.isActive || target.role.name === "super_admin") {
    await audit("unknown", input.ipAddress, RecoveryFailureCode.ACCOUNT_SCOPE_MISMATCH)
    return false
  }
  await prisma.verification.delete({ where: { id: verification.id } })
  await requestAdminPasswordReset({ email: target.email, ipAddress: input.ipAddress })
  return true
}

async function audit(email: string, ipAddress: string | null | undefined, failureCode: RecoveryFailureCode) {
  await recordAccountRecoveryAudit({ db: prisma, event: { scope: "ADMIN_DELEGATED_RESET", result: "REJECTED", failureCode, email, ipAddress, hmacSecret: secret() } })
}
