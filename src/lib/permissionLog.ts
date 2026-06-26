/**
 * ============================================
 * 权限变更日志模块 (v0.5.9)
 * ============================================
 * 功能说明：
 *   - 记录权限变更日志
 *   - 记录角色变更日志
 *   - 记录用户变更日志
 *   - 支持日志查询和审计
 * ============================================
 */

import { LogAction, TargetType } from "@prisma/client"
import { NextRequest } from "next/server"
import { logger } from "./logger"
import { prisma } from "./prisma"

export interface LogEntry {
  action: LogAction
  targetType: TargetType
  targetId: string
  operatorId: string
  beforeData?: Record<string, unknown> | null
  afterData?: Record<string, unknown> | null
  ipAddress?: string | null
  userAgent?: string | null
}

export async function logCreate(
  request: NextRequest,
  operatorId: string,
  targetType: TargetType,
  targetId: string,
  afterData: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.permissionLog.create({
      data: {
        action: LogAction.CREATE,
        targetType,
        targetId,
        operatorId,
        afterData: afterData as object,
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
        userAgent: request.headers.get("user-agent") || null,
      },
    })
  } catch (error) {
    logger.error("Failed to log create", error)
  }
}

export async function logUpdate(
  request: NextRequest,
  operatorId: string,
  targetType: TargetType,
  targetId: string,
  beforeData: Record<string, unknown>,
  afterData: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.permissionLog.create({
      data: {
        action: LogAction.UPDATE,
        targetType,
        targetId,
        operatorId,
        beforeData: beforeData as object,
        afterData: afterData as object,
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
        userAgent: request.headers.get("user-agent") || null,
      },
    })
  } catch (error) {
    logger.error("Failed to log update", error)
  }
}

export async function logDelete(
  request: NextRequest,
  operatorId: string,
  targetType: TargetType,
  targetId: string,
  beforeData: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.permissionLog.create({
      data: {
        action: LogAction.DELETE,
        targetType,
        targetId,
        operatorId,
        beforeData: beforeData as object,
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
        userAgent: request.headers.get("user-agent") || null,
      },
    })
  } catch (error) {
    logger.error("Failed to log delete", error)
  }
}

export interface GetLogsOptions {
  page?: number
  pageSize?: number
  targetType?: TargetType
  targetId?: string
  operatorId?: string
  action?: LogAction
  startDate?: Date
  endDate?: Date
}

export interface PermissionLogListResult {
  list: Array<{
    id: string
    action: LogAction
    targetType: TargetType
    targetId: string
    operatorId: string
    beforeData: unknown | null
    afterData: unknown | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date
    operator?: {
      username: string
      email: string
    }
  }>
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export async function getLogs(options: GetLogsOptions = {}): Promise<PermissionLogListResult> {
  const {
    page = 1,
    pageSize = 20,
    targetType,
    targetId,
    operatorId,
    action,
    startDate,
    endDate,
  } = options

  const where: Record<string, unknown> = {}

  if (targetType) {
    where.targetType = targetType
  }
  if (targetId) {
    where.targetId = targetId
  }
  if (operatorId) {
    where.operatorId = operatorId
  }
  if (action) {
    where.action = action
  }
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) {
      (where.createdAt as Record<string, Date>).gte = startDate
    }
    if (endDate) {
      (where.createdAt as Record<string, Date>).lte = endDate
    }
  }

  const [list, total] = await Promise.all([
    prisma.permissionLog.findMany({
      where,
      include: {
        operator: {
          select: {
            username: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.permissionLog.count({ where }),
  ])

  return {
    list,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}