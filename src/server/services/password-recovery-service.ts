import { randomUUID } from "node:crypto"
import nodemailer from "nodemailer"
import { auth } from "@/lib/auth"
import { normalizeEmail, RecoveryFailureCode } from "@/lib/auth/recovery-audit"
import { generateOtp, hashRecoverySecret, verifyRecoverySecret } from "@/lib/auth/recovery-crypto"
import { validatePassword } from "@/lib/auth/password-policy"
import { prisma } from "@/lib/prisma"
import { recordAccountRecoveryAudit } from "./account-recovery-audit-service"
import { enqueueAuthEmail } from "./auth-email-job-service"

const OTP_TTL_MS = 5 * 60 * 1000
const OTP_ATTEMPT_LIMIT = 3

export async function requestUserPasswordReset(input: { email: string; ipAddress?: string | null }) {
  const email = normalizeEmail(input.email)
  const hmacSecret = recoveryHmacSecret()
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, banned: true, banExpires: true, adminProfile: { select: { id: true } } },
  })
  if (!user) return reject(input, email, hmacSecret, RecoveryFailureCode.ACCOUNT_NOT_FOUND)
  if (user.adminProfile) return reject(input, email, hmacSecret, RecoveryFailureCode.ACCOUNT_SCOPE_MISMATCH)
  if (user.banned && (!user.banExpires || user.banExpires > new Date())) return reject(input, email, hmacSecret, RecoveryFailureCode.ACCOUNT_DISABLED)

  const otp = generateOtp()
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)
  await enqueueAuthEmail({
    email, otp,
    subject: "SoloSales 密码重置验证码",
    text: "您的密码重置验证码是 " + otp + "，5 分钟内有效。若非本人操作，请忽略此邮件。",
    verificationJson: JSON.stringify({ id: otpIdentifier(email, hmacSecret), identifier: "password-reset:user", value: hashRecoverySecret(otp, hmacSecret) + ":0", expiresAt: expiresAt.toISOString() }),
  })
  await recordAccountRecoveryAudit({ db: prisma, event: { scope: "USER_PASSWORD_RESET", result: "ACCEPTED", email, ipAddress: input.ipAddress, hmacSecret } })
}

export async function confirmUserPasswordReset(input: { email: string; otp: string; password: string; ipAddress?: string | null }) {
  const email = normalizeEmail(input.email)
  const hmacSecret = recoveryHmacSecret()
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, banned: true, banExpires: true, adminProfile: { select: { id: true } } } })
  if (!user || user.adminProfile) return reject(input, email, hmacSecret, RecoveryFailureCode.ACCOUNT_SCOPE_MISMATCH)
  if (user.banned && (!user.banExpires || user.banExpires > new Date())) return reject(input, email, hmacSecret, RecoveryFailureCode.ACCOUNT_DISABLED)
  if (!validatePassword(input.password).valid) return false

  const verification = await prisma.verification.findUnique({ where: { id: otpIdentifier(email, hmacSecret) } })
  if (!verification || verification.expiresAt <= new Date()) return reject(input, email, hmacSecret, RecoveryFailureCode.OTP_EXPIRED)
  const [expectedHash, attemptsValue] = verification.value.split(":")
  const attempts = Number(attemptsValue)
  if (attempts >= OTP_ATTEMPT_LIMIT) return reject(input, email, hmacSecret, RecoveryFailureCode.OTP_ATTEMPTS_EXHAUSTED)
  if (!verifyRecoverySecret(input.otp, expectedHash, hmacSecret)) {
    await prisma.verification.update({ where: { id: verification.id }, data: { value: `${expectedHash}:${attempts + 1}` } })
    return reject(input, email, hmacSecret, RecoveryFailureCode.OTP_INVALID)
  }
  await prisma.verification.delete({ where: { id: verification.id } })
  const token = randomUUID()
  await prisma.verification.create({ data: { id: `reset-password:${token}`, identifier: "password-reset:user", value: user.id, expiresAt: new Date(Date.now() + 60_000) } })
  try {
    await auth.api.resetPassword({ body: { token, newPassword: input.password } })
  } catch {
    return reject(input, email, hmacSecret, RecoveryFailureCode.DEPENDENCY_UNAVAILABLE)
  }
  await recordAccountRecoveryAudit({ db: prisma, event: { scope: "USER_PASSWORD_RESET", result: "ACCEPTED", email, ipAddress: input.ipAddress, hmacSecret } })
  return true
}

function otpIdentifier(email: string, hmacSecret: string) { return `password-reset:user:${hashRecoverySecret(email, hmacSecret)}` }
function recoveryHmacSecret() {
  const secret = process.env.AUTH_RECOVERY_HMAC_SECRET || process.env.BETTER_AUTH_SECRET
  if (!secret) throw new Error("AUTH_RECOVERY_HMAC_SECRET is required")
  return secret
}
async function reject(input: { ipAddress?: string | null }, email: string, hmacSecret: string, failureCode: RecoveryFailureCode) {
  await recordAccountRecoveryAudit({ db: prisma, event: { scope: "USER_PASSWORD_RESET", result: "REJECTED", failureCode, email, ipAddress: input.ipAddress, hmacSecret } })
  return false
}
async function sendOtpEmail(email: string, otp: string) {
  const port = Number(process.env.SMTP_PORT)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || ![465, 587].includes(port)) throw new Error("SMTP recovery delivery is not configured")
  const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, requireTLS: port === 587, tls: { rejectUnauthorized: true }, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
  await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: email, subject: "SoloSales 密码重置验证码", text: `您的密码重置验证码是 ${otp}，5 分钟内有效。若非本人操作，请忽略此邮件。` })
}
