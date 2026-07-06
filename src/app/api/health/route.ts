/**
 * 修改时间：2026-07-06 00:00:00 +08:00
 * 修改内容：健康检查版本标识同步至 1.7.6，并保留统一外部依赖故障保护。
 * 修改模型：gpt-5
 *
 * ============================================
 * 健康检查 API 端点 (v1.7.6)
 * ============================================
 * 功能说明：
 *   - 检查数据库连接状态
 *   - 检查 Redis 连接状态
 *   - 返回服务健康状况
 *   - 用于负载均衡器和监控平台的健康检测
 * ============================================
 */

import { prisma } from "@/lib/prisma"
import redis from "@/lib/redis"
import { successResponse } from "@/server/contracts/api"
import { withDependencyGuard } from "@/server/services/dependency-guard"

/**
 * 健康检查响应数据结构
 */
interface HealthCheckResponse {
  status: "healthy" | "unhealthy"
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: HealthCheckItem
    redis: HealthCheckItem
  }
}

/**
 * 单个检查项的数据结构
 */
interface HealthCheckItem {
  status: "ok" | "error"
  latency?: number
  error?: string
}

/**
 * GET /api/health
 * 返回服务健康状况
 */
export async function GET() {
  const _startTime = Date.now()
  const response: HealthCheckResponse = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.7.6",
    uptime: process.uptime(),
    checks: {
      database: { status: "ok" },
      redis: { status: "ok" },
    },
  }

  // 检查数据库连接
  try {
    const dbStart = Date.now()
    await withDependencyGuard({
      dependency: "database",
      label: "health.database",
      operation: () => prisma.$queryRaw`SELECT 1`,
      timeoutMs: 3000,
      maxAttempts: 1,
      unavailableMessage: "数据库连接暂时不可用，请稍后重试",
    })
    response.checks.database.latency = Date.now() - dbStart
  } catch (error: unknown) {
    response.checks.database.status = "error"
    response.checks.database.error =
      error instanceof Error ? error.message : "Database connection failed"
    response.status = "unhealthy"
  }

  // 检查 Redis 连接
  try {
    const redisStart = Date.now()
    await withDependencyGuard({
      dependency: "redis",
      label: "health.redis",
      operation: () => redis.ping(),
      timeoutMs: 1500,
      maxAttempts: 1,
      unavailableMessage: "缓存服务暂时不可用，请稍后重试",
    })
    response.checks.redis.latency = Date.now() - redisStart
  } catch (error: unknown) {
    response.checks.redis.status = "error"
    response.checks.redis.error =
      error instanceof Error ? error.message : "Redis connection failed"
    // 注意：Redis 失败不立即标记为 unhealthy，因为某些功能可能降级
    // 如果需要强制 Redis 可用，取消下面的注释
    // response.status = "unhealthy"
  }

  // HTTP 状态码仍按健康状态返回；响应体同时提供标准 data 和旧顶层字段，兼容负载均衡器探针。
  const statusCode = response.status === "healthy" ? 200 : 503
  return successResponse(response, {
    status: statusCode,
    topLevel: response,
  })
}
