import { randomUUID } from "node:crypto"
import nodemailer from "nodemailer"
import { decryptRecoveryPayload, encryptRecoveryPayload, type EncryptedRecoveryPayload } from "@/lib/auth/recovery-crypto"
import { prisma } from "@/lib/prisma"
import { enqueueBackgroundJob, completeBackgroundJob, failBackgroundJob, listRunnableBackgroundJobs } from "./background-job-service"

type AuthEmailPayload = EncryptedRecoveryPayload
type AuthEmailMessage = { email: string; otp: string; subject: string; text: string; verificationJson?: string }
type AuthEmailBatch = { messages: AuthEmailMessage[]; verificationJson: string }

export async function enqueueAuthEmail(input: AuthEmailMessage) {
  const payload = encryptRecoveryPayload(input, keyring())
  return enqueueBackgroundJob({ type: "AUTH_EMAIL_DISPATCH", payload, maxAttempts: 3 })
}

export async function enqueueAuthEmailBatch(input: AuthEmailBatch) {
  const payload = encryptRecoveryPayload({ kind: "batch", messages: JSON.stringify(input.messages), verificationJson: input.verificationJson }, keyring())
  return enqueueBackgroundJob({ type: "AUTH_EMAIL_DISPATCH", payload, maxAttempts: 3 })
}

export async function processAuthEmailJobs(now = new Date()) {
  const jobs = await listRunnableBackgroundJobs({ now, limit: 20 })
  const authJobs = jobs.filter((job) => job.type === "AUTH_EMAIL_DISPATCH")
  for (const job of authJobs) {
    const lockToken = randomUUID()
    const claimed = await prisma.backgroundJob.updateMany({
      where: { id: job.id, status: { in: ["QUEUED", "FAILED"] }, availableAt: { lte: now } },
      data: { status: "RUNNING", lockedAt: now, lockToken, lockExpiresAt: new Date(now.getTime() + 60_000) },
    })
    if (claimed.count !== 1) continue
    try {
      const message = decryptRecoveryPayload(job.payload as unknown as AuthEmailPayload, keyring()) as AuthEmailMessage & { kind?: string; messages?: string }
      const messages = message.kind === "batch" ? JSON.parse(message.messages || "[]") as AuthEmailMessage[] : [message]
      for (const item of messages) await send(item)
      const verificationJson = message.verificationJson
      if (verificationJson) {
        const verification = JSON.parse(verificationJson) as { id: string; identifier: string; value: string; expiresAt: string }
        await prisma.verification.upsert({
          where: { id: verification.id },
          create: { id: verification.id, identifier: verification.identifier, value: verification.value, expiresAt: new Date(verification.expiresAt) },
          update: { identifier: verification.identifier, value: verification.value, expiresAt: new Date(verification.expiresAt) },
        })
      }
      await completeBackgroundJob(job.id, new Date())
    } catch (error) {
      await failBackgroundJob(job, error, new Date())
    }
  }
}

function keyring() {
  const key = process.env.AUTH_RECOVERY_ENCRYPTION_KEY
  if (!key) throw new Error("AUTH_RECOVERY_ENCRYPTION_KEY is required")
  const keyId = process.env.AUTH_RECOVERY_ENCRYPTION_KEY_ID || "current"
  const oldKeys = process.env.AUTH_RECOVERY_ENCRYPTION_OLD_KEYS ? JSON.parse(process.env.AUTH_RECOVERY_ENCRYPTION_OLD_KEYS) as Record<string, string> : {}
  return { activeKeyId: keyId, keys: { ...oldKeys, [keyId]: key } }
}

async function send(message: AuthEmailMessage) {
  const port = Number(process.env.SMTP_PORT)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || ![465, 587].includes(port)) throw new Error("SMTP recovery delivery is not configured")
  const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, requireTLS: port === 587, tls: { rejectUnauthorized: true }, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
  await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: message.email, subject: message.subject, text: message.text })
}
