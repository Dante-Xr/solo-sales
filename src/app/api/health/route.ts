/**
 * ============================================
 * 健康检查 API 端点 (v0.4.3)
 * ============================================
 * 功能说明：
 *   - 检查数据库连接状态
 *   - 检查 Redis 连接状态
 *   - 返回服务健康状况
 *   - 用于负载均衡器和监控平台的健康检测
 * ============================================
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import redis from "@/lib/redis"

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
export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  const startTime = Date.now()
  const response: HealthCheckResponse = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.4.3",
    uptime: process.uptime(),
    checks: {
      database: { status: "ok" },
      redis: { status: "ok" },
    },
  }

  // 检查数据库连接
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    response.checks.database.latency = Date.now() - dbStart
  } catch (error) {
    response.checks.database.status = "error"
    response.checks.database.error =
      error instanceof Error ? error.message : "Database connection failed"
    response.status = "unhealthy"
  }

  // 检查 Redis 连接
  try {
    const redisStart = Date.now()
    await redis.ping()
    response.checks.redis.latency = Date.now() - redisStart
  } catch (error) {
    response.checks.redis.status = "error"
    response.checks.redis.error =
      error instanceof Error ? error.message : "Redis connection failed"
    // 注意：Redis 失败不立即标记为 unhealthy，因为某些功能可能降级
    // 如果需要强制 Redis 可用，取消下面的注释
    // response.status = "unhealthy"
  }

  // 返回响应
  const statusCode = response.status === "healthy" ? 200 : 503
  return NextResponse.json(response, { status: statusCode })
}