import { Redis } from "@upstash/redis"
import { fingerprint } from "./recovery-audit"
import { RECOVERY_EMAIL_RESEND_COOLDOWN_SECONDS } from "./recovery-policy"

type Limit = { key: string; max: number; windowSeconds: number }

const REQUEST_LIMITS = [
  { suffix: "email:cooldown", max: 1, windowSeconds: RECOVERY_EMAIL_RESEND_COOLDOWN_SECONDS },
  { suffix: "email:15m", max: 3, windowSeconds: 15 * 60 },
  { suffix: "email:day", max: 10, windowSeconds: 24 * 60 * 60 },
  { suffix: "ip:15m", max: 10, windowSeconds: 15 * 60 },
  { suffix: "ip:day", max: 100, windowSeconds: 24 * 60 * 60 },
]

const COUNTER_SCRIPT = "local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); end; return count"

export async function enforceRecoveryRequestRateLimit(input: { scope: string; email: string; ipAddress: string | null | undefined; hmacSecret: string }) {
  if (process.env.NODE_ENV === "production" && (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN)) {
    throw new RecoveryRateLimitDependencyError()
  }
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return

  const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  const emailFingerprint = fingerprint(`email:${input.email}`, input.hmacSecret)
  const ipFingerprint = input.ipAddress ? fingerprint(`ip:${input.ipAddress}`, input.hmacSecret) : "missing"
  const limits: Limit[] = REQUEST_LIMITS.map((limit) => ({
    key: `auth-recovery:${input.scope}:${limit.suffix.startsWith("email") ? emailFingerprint : ipFingerprint}:${limit.suffix}`,
    max: limit.max,
    windowSeconds: limit.windowSeconds,
  }))

  try {
    const results = await Promise.all(limits.map(async (limit) => Number(await (redis as unknown as { eval: (script: string, keys: string[], args: string[]) => Promise<number> }).eval(COUNTER_SCRIPT, [limit.key], [String(limit.windowSeconds)]))))
    if (results.some((count, index) => count > limits[index].max)) throw new RecoveryRateLimitExceededError()
  } catch (error) {
    if (error instanceof RecoveryRateLimitExceededError) throw error
    throw new RecoveryRateLimitDependencyError()
  }
}

export class RecoveryRateLimitExceededError extends Error {}
export class RecoveryRateLimitDependencyError extends Error {}
