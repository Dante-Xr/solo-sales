/**
 * 修改时间：2026-06-05 10:11:44 +08:00
 * 修改内容：新增后台任务仓储封装，集中队列记录创建、恢复查询、运行/完成/失败状态更新。
 * 修改模型：gpt-5.5
 */
import "server-only"

import type { BackgroundJobStatus, BackgroundJobType, Prisma, PrismaClient } from "@prisma/client"

export type BackgroundJobDbClient = PrismaClient | Prisma.TransactionClient

export function createBackgroundJobRecord(
  db: BackgroundJobDbClient,
  data: {
    type: BackgroundJobType
    payload: Prisma.InputJsonValue
    maxAttempts: number
    availableAt?: Date
  }
) {
  return db.backgroundJob.create({
    data: {
      type: data.type,
      payload: data.payload,
      maxAttempts: data.maxAttempts,
      availableAt: data.availableAt,
    },
  })
}

export function findRunnableBackgroundJobRecords(
  db: BackgroundJobDbClient,
  args: { now: Date; limit: number }
) {
  return db.backgroundJob.findMany({
    where: {
      availableAt: { lte: args.now },
      OR: [
        { status: { in: ["QUEUED", "FAILED"] } },
        { status: "RUNNING", lockExpiresAt: { lte: args.now } },
      ],
    },
    orderBy: [{ availableAt: "asc" }, { createdAt: "asc" }],
    take: args.limit,
  })
}

export function markBackgroundJobRunning(
  db: BackgroundJobDbClient,
  jobId: string,
  lockedAt: Date
) {
  return db.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: "RUNNING",
      lockedAt,
    },
  })
}

export function markBackgroundJobCompleted(
  db: BackgroundJobDbClient,
  jobId: string,
  completedAt: Date
) {
  return db.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: "COMPLETED",
      completedAt,
      lockedAt: null,
      lockToken: null,
      lockExpiresAt: null,
    },
  })
}

export function markBackgroundJobFailed(
  db: BackgroundJobDbClient,
  jobId: string,
  data: {
    status: BackgroundJobStatus
    attempts: number
    lastError: string
    availableAt: Date
  }
) {
  return db.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: data.status,
      attempts: data.attempts,
      lastError: data.lastError,
      availableAt: data.availableAt,
      lockedAt: null,
      lockToken: null,
      lockExpiresAt: null,
    },
  })
}
