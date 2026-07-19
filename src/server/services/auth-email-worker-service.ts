import "server-only"

import { randomUUID } from "node:crypto"
import nodemailer from "nodemailer"
import { prisma } from "@/lib/prisma"
import redis from "@/lib/redis"
import { decryptRecoveryPayload } from "@/lib/auth/recovery-crypto"

export const AUTH_EMAIL_WORKER_CONFIG_ID = "auth-email-worker"
export const AUTH_EMAIL_WORKER_INTERVALS = [1, 2, 5, 10] as const
export const AUTH_EMAIL_WORKER_BATCH_SIZES = [1, 3, 5, 10] as const
export const AUTH_EMAIL_WORKER_LEASE_MS = 25_000
export const AUTH_EMAIL_WORKER_STALE_MS = 15 * 60 * 1000

export class AuthEmailWorkerDisabledError extends Error {
  code = "AUTH_EMAIL_WORKER_DISABLED"

  constructor() {
    super("认证邮件任务当前已停用")
  }
}

type WorkerConfigInput = { enabled: boolean; intervalMinutes: number; batchSize: number }

export async function getAuthEmailWorkerConfig() {
  return prisma.authEmailWorkerConfig.upsert({
    where: { id: AUTH_EMAIL_WORKER_CONFIG_ID },
    create: { id: AUTH_EMAIL_WORKER_CONFIG_ID, enabled: false, intervalMinutes: 5, batchSize: 5 },
    update: {},
  })
}

export async function assertAuthEmailWorkerEnabled() {
  const config = await getAuthEmailWorkerConfig()
  if (!config.enabled) throw new AuthEmailWorkerDisabledError()
  return config
}

export async function updateAuthEmailWorkerConfig(input: WorkerConfigInput) {
  validateWorkerConfig(input)
  if (input.enabled) await preflightAuthEmailWorker()
  await getAuthEmailWorkerConfig()
  return prisma.authEmailWorkerConfig.update({
    where: { id: AUTH_EMAIL_WORKER_CONFIG_ID },
    data: input,
  })
}

export async function getAuthEmailWorkerStatus() {
  const config = await getAuthEmailWorkerConfig()
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const [runs, deadLetters] = await Promise.all([
    prisma.authEmailWorkerRun.findMany({
      where: { startedAt: { gte: since } },
      orderBy: { startedAt: "desc" },
      take: 50,
      select: { id: true, trigger: true, status: true, processed: true, delivered: true, deadLettered: true, error: true, startedAt: true, completedAt: true },
    }),
    prisma.backgroundJob.findMany({
      where: { type: "AUTH_EMAIL_DISPATCH", status: "DEAD_LETTER" },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: { id: true, attempts: true, maxAttempts: true, lastError: true, createdAt: true, updatedAt: true },
    }),
  ])
  const { leaseToken: _leaseToken, leaseExpiresAt: _leaseExpiresAt, ...safeConfig } = config
  return { config: safeConfig, runs, deadLetters }
}

export async function preflightAuthEmailWorker() {
  const key = process.env.AUTH_RECOVERY_ENCRYPTION_KEY
  if (!key || Buffer.byteLength(key, "utf8") !== 32) throw new Error("认证邮件加密密钥必须为 32 字节")
  if (!process.env.AUTH_RECOVERY_HMAC_SECRET && !process.env.BETTER_AUTH_SECRET) throw new Error("认证邮件 HMAC 密钥未配置")
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) throw new Error("Redis 配置未完成")
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || ![465, 587].includes(Number(process.env.SMTP_PORT))) {
    throw new Error("SMTP recovery delivery is not configured")
  }
  await prisma.$queryRaw`SELECT 1`
  await redis.ping()
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    requireTLS: Number(process.env.SMTP_PORT) === 587,
    tls: { rejectUnauthorized: true },
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  await transporter.verify()
}

export async function isAuthEmailWorkerDegraded(now = new Date()) {
  const config = await getAuthEmailWorkerConfig()
  if (!config.enabled) return false
  if (config.consecutiveFailures > 0) return true
  return !config.lastHeartbeatAt || now.getTime() - config.lastHeartbeatAt.getTime() > AUTH_EMAIL_WORKER_STALE_MS
}

export async function runAuthEmailWorker(input: {
  trigger: "SCHEDULED" | "MANUAL" | "HTTP"
  initiatedById?: string
  bypassInterval?: boolean
  now?: Date
  dispatch: (args: { now: Date; limit: number; staleAfterMs: number }) => Promise<{ processed: number; delivered: number; deadLettered: number }>
}) {
  const now = input.now ?? new Date()
  const config = await getAuthEmailWorkerConfig()
  if (!config.enabled) return recordSkipped(input, "WORKER_DISABLED", now)
  if (!input.bypassInterval && config.lastStartedAt && now.getTime() - config.lastStartedAt.getTime() < config.intervalMinutes * 60_000) {
    return recordSkipped(input, "INTERVAL_NOT_ELAPSED", now)
  }

  const leaseToken = randomUUID()
  const lease = await prisma.authEmailWorkerConfig.updateMany({
    where: { id: AUTH_EMAIL_WORKER_CONFIG_ID, OR: [{ leaseExpiresAt: null }, { leaseExpiresAt: { lte: now } }] },
    data: { leaseToken, leaseExpiresAt: new Date(now.getTime() + AUTH_EMAIL_WORKER_LEASE_MS), lastStartedAt: now },
  })
  if (lease.count !== 1) return recordSkipped(input, "LEASE_HELD", now)

  const run = await prisma.authEmailWorkerRun.create({ data: { configId: AUTH_EMAIL_WORKER_CONFIG_ID, trigger: input.trigger, status: "SUCCEEDED", initiatedById: input.initiatedById } })
  try {
    const result = await input.dispatch({ now, limit: config.batchSize, staleAfterMs: AUTH_EMAIL_WORKER_STALE_MS })
    await prisma.$transaction([
      prisma.authEmailWorkerRun.update({ where: { id: run.id }, data: { ...result, completedAt: new Date() } }),
      prisma.authEmailWorkerConfig.update({ where: { id: AUTH_EMAIL_WORKER_CONFIG_ID }, data: { lastHeartbeatAt: new Date(), lastCompletedAt: new Date(), leaseToken: null, leaseExpiresAt: null, consecutiveFailures: 0, lastError: null } }),
    ])
    await prisma.authEmailWorkerRun.deleteMany({ where: { startedAt: { lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } } })
    return { status: "SUCCEEDED" as const, ...result }
  } catch (error) {
    const message = sanitizeWorkerError(error)
    await prisma.$transaction([
      prisma.authEmailWorkerRun.update({ where: { id: run.id }, data: { status: "FAILED", error: message, completedAt: new Date() } }),
      prisma.authEmailWorkerConfig.update({ where: { id: AUTH_EMAIL_WORKER_CONFIG_ID }, data: { lastHeartbeatAt: new Date(), leaseToken: null, leaseExpiresAt: null, consecutiveFailures: { increment: 1 }, lastError: message } }),
    ])
    throw error
  }
}

export function getAuthEmailWorkerKeyring() {
  const key = process.env.AUTH_RECOVERY_ENCRYPTION_KEY
  if (!key) throw new Error("AUTH_RECOVERY_ENCRYPTION_KEY is required")
  const keyId = process.env.AUTH_RECOVERY_ENCRYPTION_KEY_ID || "current"
  const oldKeys = process.env.AUTH_RECOVERY_ENCRYPTION_OLD_KEYS ? JSON.parse(process.env.AUTH_RECOVERY_ENCRYPTION_OLD_KEYS) as Record<string, string> : {}
  return { activeKeyId: keyId, keys: { ...oldKeys, [keyId]: key } }
}

export function decryptAuthEmailPayload(payload: Parameters<typeof decryptRecoveryPayload>[0]) {
  return decryptRecoveryPayload(payload, getAuthEmailWorkerKeyring())
}

function validateWorkerConfig(input: WorkerConfigInput) {
  if (!AUTH_EMAIL_WORKER_INTERVALS.includes(input.intervalMinutes as 1 | 2 | 5 | 10)) throw new Error("认证邮件执行间隔无效")
  if (!AUTH_EMAIL_WORKER_BATCH_SIZES.includes(input.batchSize as 1 | 3 | 5 | 10)) throw new Error("认证邮件批量数无效")
}

async function recordSkipped(input: { trigger: "SCHEDULED" | "MANUAL" | "HTTP"; initiatedById?: string }, reason: string, now: Date) {
  await prisma.authEmailWorkerRun.create({ data: { configId: AUTH_EMAIL_WORKER_CONFIG_ID, trigger: input.trigger, status: "SKIPPED", error: reason, initiatedById: input.initiatedById, startedAt: now, completedAt: now } })
  return { status: "SKIPPED" as const, processed: 0, delivered: 0, deadLettered: 0 }
}

function sanitizeWorkerError(error: unknown) {
  const message = error instanceof Error ? error.message : "认证邮件 worker 执行失败"
  return message.replace(/(pass(word)?|token|secret)=?[^\s,;]+/gi, "$1=[REDACTED]").slice(0, 500)
}
