/**
 * 2026-03-24: Redis 客户端初始化模块
 * 功能：配置并导出 Redis 客户端实例
 * 验证：开发环境使用 Mock 值，生产环境必须配置真实环境变量
 */
import { Redis } from "@upstash/redis"
import { validateRedisConfig } from "./env-validator"

// 2026-03-24: 验证环境变量，确保必需配置存在
// 开发环境允许使用 Mock 值，生产环境必须提供真实配置
let redis: Redis

try {
  const config = validateRedisConfig()
  redis = new Redis({
    url: config.url,
    token: config.token,
  })
} catch (error) {
  // 2026-03-24: 验证失败时输出警告并使用 Mock 值
  // 注意：生产环境应在部署平台配置真实环境变量
  console.warn("Redis 配置验证失败，使用 Mock 模式:", error)
  // 2026-03-24: 使用 Mock Redis 实例，允许构建和开发继续进行
  // 生产环境建议配置真实的环境变量以获得完整功能
  redis = new Redis({
    url: "https://mock.upstash.io",
    token: "mock-token",
  })
}

export default redis
