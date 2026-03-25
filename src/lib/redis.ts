/**
 * ============================================
 * Redis 客户端初始化模块 (v0.4.3 修复版)
 * ============================================
 * 功能说明：
 *   - 配置并导出 Redis 客户端实例
 *   - 优先使用真实 Redis，配置缺失时使用 Mock
 *   - 生产环境构建时使用 Mock，运行时验证
 * ============================================
 */
import { Redis } from "@upstash/redis"
import { validateRedisConfig } from "./env-validator"

/**
 * Redis 客户端单例
 */
let redis: Redis

/**
 * 检测是否在构建阶段
 * Next.js 构建时 NEXT_RUNTIME 不存在或为 "nodejs"
 */
const isBuildTime = process.env.NEXT_RUNTIME === undefined

/**
 * 检测是否在 Serverless 运行时
 */
const isServerless = process.env.NEXT_RUNTIME === "edge" || process.env.NEXT_RUNTIME === "nodejs"

/**
 * 初始化 Redis 客户端
 * - 构建阶段：使用 Mock（避免构建失败）
 * - 开发环境：未配置时使用 Mock
 * - 生产环境：优先使用真实配置，缺失时使用 Mock 但记录警告
 */
function initRedis(): Redis {
  try {
    const config = validateRedisConfig()
    console.log("✅ Redis 配置验证通过")
    return new Redis({
      url: config.url,
      token: config.token,
    })
  } catch (error) {
    // 构建阶段或环境变量缺失：使用 Mock
    if (isBuildTime || process.env.NODE_ENV !== "production") {
      console.warn("⚠️  Redis 配置验证失败，使用 Mock 模式:", error)
      return new Redis({
        url: "https://mock.upstash.io",
        token: "mock-token",
      })
    }

    // 生产环境运行时有配置缺失：使用 Mock 但警告
    // 注意：这允许构建通过，但运行时功能可能降级
    console.error("⚠️  生产环境 Redis 配置缺失，缓存功能将降级:", error)
    console.error("💡 请在 Netlify 环境变量中配置 UPSTASH_REDIS_REST_URL 和 UPSTASH_REDIS_REST_TOKEN")

    return new Redis({
      url: "https://mock.upstash.io",
      token: "mock-token",
    })
  }
}

redis = initRedis()

export default redis
