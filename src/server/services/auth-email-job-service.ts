import { randomUUID } from "node:crypto"
import nodemailer from "nodemailer"
import { decryptRecoveryPayload, encryptRecoveryPayload, type EncryptedRecoveryPayload } from "@/lib/auth/recovery-crypto"
import { prisma } from "@/lib/prisma"
import { enqueueBackgroundJob, completeBackgroundJob, failBackgroundJob, listRunnableBackgroundJobs } from "./background-job-service"
import { assertAuthEmailWorkerEnabled, getAuthEmailWorkerKeyring } from "./auth-email-worker-service"

type AuthEmailPayload = EncryptedRecoveryPayload
type AuthEmailMessage = { email: string; otp: string; subject: string; text: string; verificationJson?: string }
type AuthEmailBatch = { messages: AuthEmailMessage[]; verificationJson: string }
type QueuedVerification = { id: string; identifier: string; value: string; expiresAt?: string; ttlSeconds?: number }
const OTP_TTL_SECONDS = 5 * 60
const JOB_STALE_MS = 15 * 60 * 1000

export async function enqueueAuthEmail(input: AuthEmailMessage) {
  await assertAuthEmailWorkerEnabled()
  const payload = encryptRecoveryPayload({ ...input, requestedAt: new Date().toISOString(), ttlSeconds: String(OTP_TTL_SECONDS) }, keyring())
  return enqueueBackgroundJob({ type: "AUTH_EMAIL_DISPATCH", payload, maxAttempts: 3 })
}

export async function enqueueAuthEmailBatch(input: AuthEmailBatch) {
  await assertAuthEmailWorkerEnabled()
  const payload = encryptRecoveryPayload({ kind: "batch", messages: JSON.stringify(input.messages), verificationJson: input.verificationJson, requestedAt: new Date().toISOString(), ttlSeconds: String(OTP_TTL_SECONDS) }, keyring())
  return enqueueBackgroundJob({ type: "AUTH_EMAIL_DISPATCH", payload, maxAttempts: 3 })
}

export async function dispatchAuthEmailJobs(args: { now?: Date; limit?: number; staleAfterMs?: number } = {}) {
  const now = args.now ?? new Date()
  const jobs = await listRunnableBackgroundJobs({ now, limit: args.limit ?? 20 })
  const authJobs = jobs.filter((job) => job.type === "AUTH_EMAIL_DISPATCH")
  let delivered = 0
  let deadLettered = 0
  for (const job of authJobs) {
    if (isAuthEmailJobStale(job.createdAt, now, args.staleAfterMs ?? JOB_STALE_MS)) {
      await prisma.backgroundJob.update({ where: { id: job.id }, data: { status: "DEAD_LETTER", lastError: "AUTH_EMAIL_JOB_STALE", completedAt: now, lockedAt: null, lockToken: null, lockExpiresAt: null } })
      deadLettered += 1
      continue
    }
    const lockToken = randomUUID()
    const claimed = await prisma.backgroundJob.updateMany({
      where: { id: job.id, availableAt: { lte: now }, OR: [{ status: { in: ["QUEUED", "FAILED"] } }, { status: "RUNNING", lockExpiresAt: { lte: now } }] },
      data: { status: "RUNNING", lockedAt: now, lockToken, lockExpiresAt: new Date(now.getTime() + 60_000) },
    })
    if (claimed.count !== 1) continue
    try {
      const message = decryptRecoveryPayload(job.payload as unknown as AuthEmailPayload, keyring()) as AuthEmailMessage & { kind?: string; messages?: string; ttlSeconds?: string }
      const messages = message.kind === "batch" ? JSON.parse(message.messages || "[]") as AuthEmailMessage[] : [message]
      for (const item of messages) await send(item)
      delivered += messages.length
      const verificationJson = message.verificationJson
      if (verificationJson) {
        const verification = buildDeliveredVerification({ ...JSON.parse(verificationJson) as QueuedVerification, ttlSeconds: Number(message.ttlSeconds) || undefined }, new Date())
        await prisma.verification.upsert({
          where: { id: verification.id },
          create: verification,
          update: verification,
        })
      }
      await completeBackgroundJob(job.id, new Date())
    } catch (error) {
      await failBackgroundJob(job, error, new Date())
    }
  }
  return { processed: authJobs.length, delivered, deadLettered }
}

function keyring() {
  return getAuthEmailWorkerKeyring()
}

export function isAuthEmailJobStale(createdAt: Date, now = new Date(), staleAfterMs = JOB_STALE_MS) {
  return now.getTime() - createdAt.getTime() > staleAfterMs
}

export function buildDeliveredVerification(input: QueuedVerification, acceptedAt = new Date()) {
  const ttlSeconds = input.ttlSeconds ?? 0
  return {
    id: input.id,
    identifier: input.identifier,
    value: input.value,
    expiresAt: ttlSeconds > 0 ? new Date(acceptedAt.getTime() + ttlSeconds * 1000) : new Date(input.expiresAt || acceptedAt),
  }
}

async function send(message: AuthEmailMessage) {
  const port = Number(process.env.SMTP_PORT)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || ![465, 587].includes(port)) throw new Error("SMTP recovery delivery is not configured")
  const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, requireTLS: port === 587, tls: { rejectUnauthorized: true }, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
  await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: message.email, subject: message.subject, text: message.text })
}
