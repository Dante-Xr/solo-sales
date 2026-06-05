/**
 * 修改时间：2026-06-05 10:11:44 +08:00
 * 修改内容：新增后台任务服务，定义重任务边界、最小入队入口、重试退避和失败恢复查询。
 * 修改模型：gpt-5.5
 */
import "server-only"

import type { BackgroundJob, BackgroundJobType, Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  createBackgroundJobRecord,
  findRunnableBackgroundJobRecords,
  markBackgroundJobCompleted,
  markBackgroundJobFailed,
  markBackgroundJobRunning,
} from "@/server/repositories/background-job-repository"

const DEFAULT_MAX_ATTEMPTS = 3
const BASE_RETRY_DELAY_MS = 30_000

export const BACKGROUND_JOB_DEFINITIONS: Record<
  BackgroundJobType,
  {
    synchronousBoundary: string
    asynchronousBoundary: string
    resourceIsolation: string
  }
> = {
  WHOLESALER_IMPORT: {
    synchronousBoundary: "请求内只校验参数并记录导入任务",
    asynchronousBoundary: "批发商连接、商品拉取、映射、去重、批量写入和导入日志更新",
    resourceIsolation: "限制批次大小和重试次数，避免导入占满数据库连接",
  },
  ANALYTICS_REFRESH: {
    synchronousBoundary: "请求内只读取已有缓存或触发刷新任务",
    asynchronousBoundary: "销售、客户、商品、库存报表聚合与快照写入",
    resourceIsolation: "低优先级执行，避免后台聚合阻塞前台读写路径",
  },
  STRIPE_WEBHOOK_POST_PROCESS: {
    synchronousBoundary: "webhook 请求内完成签名校验、幂等主状态写入并快速返回",
    asynchronousBoundary: "邮件、积分、营销序列等可延后副作用",
    resourceIsolation: "失败副作用进入可恢复任务，不影响支付主链路确认",
  },
  NOTIFICATION_DISPATCH: {
    synchronousBoundary: "请求内只记录待发送通知",
    asynchronousBoundary: "邮件、站内信或其他外部通知派发",
    resourceIsolation: "外部通知失败按退避重试，不占用交易请求时间",
  },
}

export function getBackgroundJobDefinitions() {
  return BACKGROUND_JOB_DEFINITIONS
}

export async function enqueueBackgroundJob(input: {
  type: BackgroundJobType
  payload: Prisma.InputJsonValue
  maxAttempts?: number
  availableAt?: Date
}) {
  return createBackgroundJobRecord(prisma, {
    type: input.type,
    payload: input.payload,
    maxAttempts: input.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
    availableAt: input.availableAt,
  })
}

export async function listRunnableBackgroundJobs(args?: { now?: Date; limit?: number }) {
  const now = args?.now ?? new Date()
  const jobs = await findRunnableBackgroundJobRecords(prisma, {
    now,
    limit: args?.limit ?? 20,
  })

  // attempts/maxAttempts 是同一行内比较，先在仓储按状态和时间收口，再在服务层过滤可恢复任务。
  return jobs.filter((job) => job.attempts < job.maxAttempts)
}

export async function startBackgroundJob(jobId: string, lockedAt = new Date()) {
  return markBackgroundJobRunning(prisma, jobId, lockedAt)
}

export async function completeBackgroundJob(jobId: string, completedAt = new Date()) {
  return markBackgroundJobCompleted(prisma, jobId, completedAt)
}

export async function failBackgroundJob(job: Pick<BackgroundJob, "id" | "attempts" | "maxAttempts">, error: unknown, now = new Date()) {
  const attempts = job.attempts + 1
  const terminal = attempts >= job.maxAttempts
  const availableAt = terminal ? now : buildRetryAvailableAt(attempts, now)

  return markBackgroundJobFailed(prisma, job.id, {
    status: terminal ? "DEAD_LETTER" : "FAILED",
    attempts,
    lastError: normalizeJobError(error),
    availableAt,
  })
}

export function buildRetryAvailableAt(attempts: number, now = new Date()) {
  const retryDelay = BASE_RETRY_DELAY_MS * 2 ** Math.max(0, attempts - 1)
  return new Date(now.getTime() + retryDelay)
}

function normalizeJobError(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return "后台任务执行失败"
}
