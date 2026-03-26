/**
 * ============================================
 * Rate Limiting (限流) 中间件 (v0.5.9)
 * ============================================
 * 功能：防止 API 被暴力攻击，基于 IP 地址进行请求频率限制
 *
 * 限制规则：
 *   - 注册 API: 5分钟内心注册不超过 3 次
 *   - 支付 API: 5分钟内心支付不超过 10 次
 *   - 搜索 API: 1分钟内不超过 30 次
 *
 * 实现原理：
 *   - 使用 Redis 存储（生产环境）
 *   - 使用 Map 存储（开发环境）
 *   - 每个时间窗口内只允许固定数量的请求
 *   - 超限时返回 HTTP 429 (Too Many Requests)
 *
 * v0.5.9 更新：
 *   - 添加 Redis 支持，实现分布式限流
 *   - 自动检测环境变量选择存储方式
 */

import { cacheGet, cacheSet } from "@/lib/cache"

// 限流配置，每种 API 有不同的限制
interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

// API 限流配置
export const RATE_LIMIT_CONFIGS = {
  register: {
    windowMs: 5 * 60 * 1000,
    maxRequests: 3,
  },
  payment: {
    windowMs: 5 * 60 * 1000,
    maxRequests: 10,
  },
  search: {
    windowMs: 1 * 60 * 1000,
    maxRequests: 30,
  },
} as const

// 内存存储，用于开发环境或无 Redis 环境
type RateLimitStore = Map<string, number[]>
const memoryStore: RateLimitStore = new Map()

// Redis 存储键前缀
const RATE_LIMIT_PREFIX = "solo:ratelimit:"

/**
 * 2026-03-24: 获取客户端 IP 地址
 * @param request - 请求对象
 * @returns 客户端 IP 地址
 */
function getClientIP(request: Request): string {
  // 2026-03-24: 优先从 X-Forwarded-For 头获取 IP（反向代理环境）
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    // X-Forwarded-For 可能包含多个 IP，取第一个
    return forwarded.split(",")[0].trim()
  }

  // 2026-03-24: 从 X-Real-IP 头获取
  const realIP = request.headers.get("x-real-ip")
  if (realIP) {
    return realIP.trim()
  }

  // 2026-03-24: 默认值（本地开发环境）
  return "127.0.0.1"
}

/**
 * 清理过期的请求记录
 */
function cleanExpiredTimestamps(timestamps: number[], windowMs: number): number[] {
  const now = Date.now()
  return timestamps.filter((timestamp) => now - timestamp < windowMs)
}

/**
 * 检查是否超过限流 - 支持 Redis 和内存存储
 */
async function checkRateLimitAsync(
  ip: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const cacheKey = `${RATE_LIMIT_PREFIX}${ip}:${config.windowMs}`
  const now = Date.now()

  let timestamps: number[] = []

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const cached = await cacheGet<number[]>(cacheKey)
    if (cached) {
      timestamps = cached
    }
  } else {
    timestamps = memoryStore.get(ip) || []
  }

  timestamps = cleanExpiredTimestamps(timestamps, config.windowMs)

  const _remaining = config.maxRequests - timestamps.length

  if (timestamps.length >= config.maxRequests) {
    const oldestTimestamp = Math.min(...timestamps)
    const resetTime = oldestTimestamp + config.windowMs

    return {
      allowed: false,
      remaining: 0,
      resetTime,
    }
  }

  timestamps.push(now)

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const ttl = Math.ceil(config.windowMs / 1000)
    await cacheSet(cacheKey, JSON.stringify(timestamps), ttl)
  } else {
    memoryStore.set(ip, timestamps)
  }

  return {
    allowed: true,
    remaining: config.maxRequests - timestamps.length,
    resetTime: now + config.windowMs,
  }
}

/**
 * 同步版本 - 仅使用内存存储（保持向后兼容）
 */
function checkRateLimit(ip: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetTime: number } {
  let timestamps = memoryStore.get(ip) || []
  timestamps = cleanExpiredTimestamps(timestamps, config.windowMs)

  const now = Date.now()
  const _remaining = config.maxRequests - timestamps.length

  if (timestamps.length >= config.maxRequests) {
    const oldestTimestamp = Math.min(...timestamps)
    const resetTime = oldestTimestamp + config.windowMs

    return {
      allowed: false,
      remaining: 0,
      resetTime,
    }
  }

  timestamps.push(now)
  memoryStore.set(ip, timestamps)

  return {
    allowed: true,
    remaining: config.maxRequests - timestamps.length,
    resetTime: now + config.windowMs,
  }
}

/**
 * 格式化时间戳为可读字符串
 */
function formatResetTime(resetTime: number): string {
  const seconds = Math.ceil((resetTime - Date.now()) / 1000)
  if (seconds < 60) {
    return `${seconds}秒后`
  }
  const minutes = Math.ceil(seconds / 60)
  return `${minutes}分钟后`
}

/**
 * 创建限流中间件（同步版本 - 使用内存存储）
 */
export function createRateLimiter(apiType: keyof typeof RATE_LIMIT_CONFIGS) {
  const config = RATE_LIMIT_CONFIGS[apiType]

  return function rateLimitMiddleware(
    request: Request
  ): { allowed: boolean; errorResponse?: Response; headers?: Headers } {
    const ip = getClientIP(request)
    const result = checkRateLimit(ip, config)

    const headers = new Headers()
    headers.set("X-RateLimit-Limit", String(config.maxRequests))
    headers.set("X-RateLimit-Remaining", String(result.remaining))
    headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetTime / 1000)))

    if (!result.allowed) {
      const errorResponse = new Response(
        JSON.stringify({
          error: "请求过于频繁，请稍后再试",
          retryAfter: formatResetTime(result.resetTime),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((result.resetTime - Date.now()) / 1000)),
            ...Object.fromEntries(headers.entries()),
          },
        }
      )

      return { allowed: false, errorResponse, headers }
    }

    return { allowed: true, headers }
  }
}

/**
 * 创建限流中间件（异步版本 - 支持 Redis 存储，适用于 Vercel Edge 等环境）
 */
export function createRateLimiterAsync(apiType: keyof typeof RATE_LIMIT_CONFIGS) {
  const config = RATE_LIMIT_CONFIGS[apiType]

  return async function rateLimitMiddleware(
    request: Request
  ): Promise<{ allowed: boolean; errorResponse?: Response; headers?: Headers }> {
    const ip = getClientIP(request)
    const result = await checkRateLimitAsync(ip, config)

    const headers = new Headers()
    headers.set("X-RateLimit-Limit", String(config.maxRequests))
    headers.set("X-RateLimit-Remaining", String(result.remaining))
    headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetTime / 1000)))

    if (!result.allowed) {
      const errorResponse = new Response(
        JSON.stringify({
          error: "请求过于频繁，请稍后再试",
          retryAfter: formatResetTime(result.resetTime),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((result.resetTime - Date.now()) / 1000)),
            ...Object.fromEntries(headers.entries()),
          },
        }
      )

      return { allowed: false, errorResponse, headers }
    }

    return { allowed: true, headers }
  }
}

/**
 * 注册 API 限流器
 */
export const registerRateLimiter = createRateLimiter("register")

/**
 * 2026-03-24: 支付 API 限流器
 */
export const paymentRateLimiter = createRateLimiter("payment")

/**
 * 2026-03-24: 搜索 API 限流器
 */
export const searchRateLimiter = createRateLimiter("search")

/**
 * 2026-03-24: 清除指定 IP 的限流记录（用于测试或管理）
 * @param ip - IP 地址
 */
export function clearRateLimit(ip: string): void {
  memoryStore.delete(ip)
}

/**
 * 2026-03-24: 清除所有限流记录（用于测试）
 */
export function clearAllRateLimits(): void {
  memoryStore.clear()
}
