import { randomUUID } from "node:crypto"
import bcrypt from "bcryptjs"
import { normalizeEmail, RecoveryFailureCode } from "@/lib/auth/recovery-audit"
import { validatePassword } from "@/lib/auth/password-policy"
import { encryptRecoveryPayload, decryptRecoveryPayload, generateOtp, hashRecoverySecret, verifyRecoverySecret } from "@/lib/auth/recovery-crypto"
import { prisma } from "@/lib/prisma"
import { enqueueAuthEmail } from "./auth-email-job-service"
import { recordAccountRecoveryAudit } from "./account-recovery-audit-service"

const TTL = 5 * 60 * 1000
function hmac() { const secret = process.env.AUTH_RECOVERY_HMAC_SECRET || process.env.BETTER_AUTH_SECRET; if (!secret) throw new Error("AUTH_RECOVERY_HMAC_SECRET is required"); return secret }
function keyring() { const key = process.env.AUTH_RECOVERY_ENCRYPTION_KEY; if (!key) throw new Error("AUTH_RECOVERY_ENCRYPTION_KEY is required"); const keyId = process.env.AUTH_RECOVERY_ENCRYPTION_KEY_ID || "current"; return { activeKeyId: keyId, keys: { [keyId]: key } } }

export async function requestAdminActivation(input: { operatorId: string; operatorEmail: string; username: string; email: string; password: string; roleId: string }) {
  const email = normalizeEmail(input.email)
  if (!input.username.trim() || !validatePassword(input.password).valid || !await prisma.role.findUnique({ where: { id: input.roleId }, select: { id: true } })) {
    await reject(input.operatorEmail, undefined, RecoveryFailureCode.ACCOUNT_SCOPE_MISMATCH)
    return false
  }
  const otp = generateOtp(); const id = `admin-activation:${randomUUID()}`; const expiresAt = new Date(Date.now() + TTL)
  const payload = JSON.stringify(encryptRecoveryPayload({ operatorId: input.operatorId, username: input.username, email, password: input.password, roleId: input.roleId, otpHash: hashRecoverySecret(otp, hmac()), attempts: "0" }, keyring()))
  await enqueueAuthEmail({ email: input.operatorEmail, otp, subject: "SoloSales 管理员创建确认", text: `创建管理员确认验证码：${otp}，5 分钟内有效。`, verificationJson: JSON.stringify({ id, identifier: "admin-activation", value: payload, expiresAt: expiresAt.toISOString() }) })
  await recordAccountRecoveryAudit({ db: prisma, event: { scope: "ADMIN_ACTIVATION", result: "ACCEPTED", email: input.operatorEmail, hmacSecret: hmac() } })
  return id
}

export async function confirmAdminActivation(input: { operatorId: string; operationId: string; otp: string }) {
  const verification = await prisma.verification.findUnique({ where: { id: input.operationId } }); if (!verification || verification.identifier !== "admin-activation" || verification.expiresAt <= new Date()) return false
  const payload = decryptRecoveryPayload(JSON.parse(verification.value), keyring()); if (payload.operatorId !== input.operatorId || !verifyRecoverySecret(input.otp, payload.otpHash, hmac())) { await reject("unknown", undefined, RecoveryFailureCode.OTP_INVALID); return false }
  await prisma.$transaction(async (tx) => {
    const duplicate = await tx.adminUser.findFirst({ where: { OR: [{ email: payload.email }, { username: payload.username }] } }); if (duplicate) throw new Error("管理员已存在")
    const user = await tx.user.create({ data: { email: payload.email, name: payload.username, role: "admin" } })
    await tx.account.create({ data: { id: randomUUID(), accountId: user.id, providerId: "credential", userId: user.id, password: await bcrypt.hash(payload.password, 12) } })
    await tx.adminUser.create({ data: { id: randomUUID(), userId: user.id, username: payload.username, email: payload.email, password: null, roleId: payload.roleId, isActive: true } })
    await tx.verification.delete({ where: { id: verification.id } })
  });
  await enqueueAuthEmail({ email: payload.email, otp: "", subject: "SoloSales 管理员账号已激活", text: "您的管理员账号已创建并激活，请使用管理员登录页和您设置的初始密码登录。" })
  return true
}

async function reject(email: string, ipAddress: string | undefined, failureCode: RecoveryFailureCode) {
  await recordAccountRecoveryAudit({ db: prisma, event: { scope: "ADMIN_ACTIVATION", result: "REJECTED", failureCode, email, ipAddress, hmacSecret: hmac() } })
}
