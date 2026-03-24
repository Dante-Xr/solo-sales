/**
 * 2026-03-24: Rate Limiting (限流) 中间件
 * 功能：防止 API 被暴力攻击，基于 IP 地址进行请求频率限制
 * 限制规则：
 *   - 注册 API: 5分钟内心注册不超过 3 次
 *   - 支付 API: 5分钟内心支付不超过 10 次
 *   - 搜索 API: 1分钟内不超过 30 次
 * 实现原理：
 *   - 使用 Map 存储每个 IP 的请求记录
 *   - 每个时间窗口内只允许固定数量的请求
 *   - 超限时返回 HTTP 429 (Too Many Requests)
 * 注意：生产环境建议使用 Redis 存储，支持分布式限流
 */

// 2026-03-24: 限流配置，每种 API 有不同的限制
interface RateLimitConfig {
  windowMs: number  // 时间窗口大小（毫秒）
  maxRequests: number  // 时间窗口内最大请求数
}

// 2026-03-24: API 限流配置
export const RATE_LIMIT_CONFIGS = {
  register: {
    windowMs: 5 * 60 * 1000,  // 5 分钟
    maxRequests: 3,  // 最多 3 次注册
  },
  payment: {
    windowMs: 5 * 60 * 1000,  // 5 分钟
    maxRequests: 10,  // 最多 10 次支付
  },
  search: {
    windowMs: 1 * 60 * 1000,  // 1 分钟
    maxRequests: 30,  // 最多 30 次搜索
  },
} as const

// 2026-03-24: 存储请求记录的 Map
// key: IP 地址，value: 请求时间戳数组
type RateLimitStore = Map<string, number[]>

// 2026-03-24: 内存存储，用于开发环境
// 生产环境应使用 Redis 等外部存储
const memoryStore: RateLimitStore = new Map()

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
 * 2026-03-24: 清理过期的请求记录
 * @param timestamps - 请求时间戳数组
 * @param windowMs - 时间窗口大小（毫秒）
 * @returns 清理后的时间戳数组
 */
function cleanExpiredTimestamps(timestamps: number[], windowMs: number): number[] {
  const now = Date.now()
  // 2026-03-24: 只保留时间窗口内的请求
  return timestamps.filter((timestamp) => now - timestamp < windowMs)
}

/**
 * 2026-03-24: 检查是否超过限流
 * @param ip - 客户端 IP 地址
 * @param config - 限流配置
 * @returns 是否允许请求
 */
function checkRateLimit(ip: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetTime: number } {
  // 2026-03-24: 获取该 IP 的请求记录
  let timestamps = memoryStore.get(ip) || []

  // 2026-03-24: 清理过期的请求记录
  timestamps = cleanExpiredTimestamps(timestamps, config.windowMs)

  const now = Date.now()
  const remaining = config.maxRequests - timestamps.length

  // 2026-03-24: 检查是否超过限制
  if (timestamps.length >= config.maxRequests) {
    // 2026-03-24: 计算距离下次可请求的时间
    const oldestTimestamp = Math.min(...timestamps)
    const resetTime = oldestTimestamp + config.windowMs

    return {
      allowed: false,
      remaining: 0,
      resetTime,
    }
  }

  // 2026-03-24: 允许请求，记录时间戳
  timestamps.push(now)
  memoryStore.set(ip, timestamps)

  return {
    allowed: true,
    remaining: config.maxRequests - timestamps.length,
    resetTime: now + config.windowMs,
  }
}

/**
 * 2026-03-24: 格式化时间戳为可读字符串
 * @param timestamp - 时间戳（毫秒）
 * @returns 格式化的字符串，如 "5分钟内"
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
 * 2026-03-24: 创建限流中间件
 * @param apiType - API 类型 ('register' | 'payment' | 'search')
 * @returns 限流处理函数
 */
export function createRateLimiter(apiType: keyof typeof RATE_LIMIT_CONFIGS) {
  const config = RATE_LIMIT_CONFIGS[apiType]

  return function rateLimitMiddleware(
    request: Request
  ): { allowed: boolean; errorResponse?: Response; headers?: Headers } {
    const ip = getClientIP(request)
    const result = checkRateLimit(ip, config)

    // 2026-03-24: 构建响应头
    const headers = new Headers()
    headers.set("X-RateLimit-Limit", String(config.maxRequests))
    headers.set("X-RateLimit-Remaining", String(result.remaining))
    headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetTime / 1000)))

    // 2026-03-24: 如果被限流，返回 429 错误
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
 * 2026-03-24: 注册 API 限流器
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
