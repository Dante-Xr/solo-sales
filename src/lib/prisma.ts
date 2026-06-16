/**
 * ============================================
 * Prisma 客户端单例模块 (v0.4.3 优化版)
 * ============================================
 * 功能说明：
 *   - 提供全局唯一的 Prisma 客户端实例
 *   - 防止开发模式下多个连接
 *   - 支持 Serverless 环境的连接优化
 * ============================================
 */

import { PrismaClient } from "@prisma/client"

/**
 * 全局 Prisma 客户端实例
 * 用于防止开发模式下热重载创建多个实例
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * 创建 Prisma 客户端实例
 * 配置说明：
 * - log: 开发环境记录所有查询，生产环境只记录错误
 * - datasources: 允许通过环境变量覆盖数据库 URL
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })
}

/**
 * 导出 Prisma 客户端单例
 * - 生产环境：每次导入都创建新实例（Serverless 特性）
 * - 开发环境：复用全局实例，防止热重载问题
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

/**
 * ============================================
 * Neon/Serverless 连接池优化说明 (v0.4.3)
 * ============================================
 * Neon PostgreSQL 使用 pgbouncer 连接池，连接配置建议：
 *
 * 在 DATABASE_URL 中添加以下参数：
 * ?pgbouncer=true&connection_limit=1&pool_timeout=10
 *
 * 参数说明：
 * - pgbouncer=true: 启用 pgbouncer 模式
 * - connection_limit=1: Serverless 函数使用单一连接
 * - pool_timeout=10: 连接超时 10 秒
 *
 * 示例：在部署平台 Secret Manager 中设置 DATABASE_URL，并附加 pgbouncer 参数。
 * ============================================
 */
