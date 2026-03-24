/**
 * ============================================
 * 批发网站 API 对接 - 日志工具 (Task 1.9)
 * ============================================
 * 功能说明：
 *   - 记录批发商品导入操作的日志
 *   - 提供日志查询和管理功能
 * ============================================
 */

import { PrismaClient } from "@prisma/client"
import type { ImportResult } from "./types"

// Prisma 客户端实例
const prisma = new PrismaClient()

/**
 * 导入日志状态
 */
export type LogStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED"

/**
 * 导入操作日志条目
 */
export interface ImportLogEntry {
  id: string
  wholesaler: string
  status: LogStatus
  totalProducts: number
  successCount: number
  failCount: number
  errorDetails: string[]
  startedAt: Date
  completedAt?: Date
  triggeredBy: string
}

/**
 * 创建导入日志
 */
export async function createImportLog(
  wholesaler: string,
  triggeredBy: string
): Promise<string> {
  const log = await prisma.importLog.create({
    data: {
      wholesaler,
      status: "PENDING",
      triggeredBy,
    },
  })
  return log.id
}

/**
 * 更新导入日志 - 开始运行
 */
export async function startImportLog(logId: string): Promise<void> {
  await prisma.importLog.update({
    where: { id: logId },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
    },
  })
}

/**
 * 更新导入日志 - 进度更新
 */
export async function updateImportProgress(
  logId: string,
  totalProducts: number,
  successCount: number,
  failCount: number
): Promise<void> {
  await prisma.importLog.update({
    where: { id: logId },
    data: {
      totalProducts,
      successCount,
      failCount,
    },
  })
}

/**
 * 更新导入日志 - 完成
 */
export async function completeImportLog(
  logId: string,
  result: ImportResult
): Promise<void> {
  await prisma.importLog.update({
    where: { id: logId },
    data: {
      status: result.success ? "COMPLETED" : "FAILED",
      totalProducts: result.total,
      successCount: result.successCount,
      failCount: result.failCount,
      errorDetails: result.errors,
      completedAt: new Date(),
    },
  })
}

/**
 * 更新导入日志 - 失败
 */
export async function failImportLog(
  logId: string,
  error: string
): Promise<void> {
  await prisma.importLog.update({
    where: { id: logId },
    data: {
      status: "FAILED",
      errorDetails: [error],
      completedAt: new Date(),
    },
  })
}

/**
 * 获取导入日志列表
 */
export async function getImportLogs(
  page = 1,
  pageSize = 20
): Promise<{
  logs: ImportLogEntry[]
  total: number
  totalPages: number
}> {
  const [logs, total] = await Promise.all([
    prisma.importLog.findMany({
      orderBy: { startedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.importLog.count(),
  ])

  return {
    logs: logs.map((log) => ({
      id: log.id,
      wholesaler: log.wholesaler,
      status: log.status as LogStatus,
      totalProducts: log.totalProducts,
      successCount: log.successCount,
      failCount: log.failCount,
      errorDetails: log.errorDetails,
      startedAt: log.startedAt,
      completedAt: log.completedAt ?? undefined,
      triggeredBy: log.triggeredBy,
    })),
    total,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * 获取单个导入日志详情
 */
export async function getImportLogById(logId: string): Promise<ImportLogEntry | null> {
  const log = await prisma.importLog.findUnique({
    where: { id: logId },
  })

  if (!log) {
    return null
  }

  return {
    id: log.id,
    wholesaler: log.wholesaler,
    status: log.status as LogStatus,
    totalProducts: log.totalProducts,
    successCount: log.successCount,
    failCount: log.failCount,
    errorDetails: log.errorDetails,
    startedAt: log.startedAt,
    completedAt: log.completedAt ?? undefined,
    triggeredBy: log.triggeredBy,
  }
}

/**
 * 记录操作日志到控制台（开发环境）
 */
export function logToConsole(level: "info" | "warn" | "error", message: string, data?: unknown): void {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`

  switch (level) {
    case "info":
      console.log(prefix, message, data ?? "")
      break
    case "warn":
      console.warn(prefix, message, data ?? "")
      break
    case "error":
      console.error(prefix, message, data ?? "")
      break
  }
}