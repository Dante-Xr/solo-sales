/**
 * 修改时间：2026-06-04 16:28:48 +08:00
 * 修改内容：新增统一外部依赖故障保护，集中处理数据库、Redis 等依赖的超时、有限重试、错误映射和结构化日志。
 * 修改模型：gpt-5.5
 */
import "server-only"

import { AppError, ErrorCodes } from "@/server/contracts/errors"

export type DependencyKind = "database" | "redis" | "payment" | "cache"

export interface DependencyGuardOptions<T> {
  dependency: DependencyKind
  label: string
  operation: () => Promise<T>
  timeoutMs?: number
  maxAttempts?: number
  retryDelayMs?: (attempt: number) => number
  retryable?: (error: unknown) => boolean
  onRetry?: (error: unknown, attempt: number) => Promise<void> | void
  unavailableMessage?: string
  timeoutMessage?: string
}

export interface DependencyErrorLog {
  dependency: DependencyKind
  label: string
  attempt: number
  maxAttempts: number
  code?: string
  message: string
}

export const DEFAULT_DEPENDENCY_TIMEOUT_MS = 3000
const DEFAULT_MAX_ATTEMPTS = 1

export function isTransientDependencyError(error: unknown, dependency: DependencyKind): boolean {
  if (error instanceof AppError) {
    return error.code === ErrorCodes.SERVICE_UNAVAILABLE
  }

  const code = getErrorCode(error)
  const message = getErrorMessage(error)

  if (dependency === "database") {
    // P1017 是连接已关闭；P1001/P1002 是 Prisma 常见数据库不可达/超时错误。
    return (
      code === "P1017" ||
      code === "P1001" ||
      code === "P1002" ||
      message.includes("Can't reach database server") ||
      message.includes("Server has closed the connection") ||
      message.includes("Timed out fetching a new connection") ||
      message.includes("Connection terminated") ||
      message.includes("ECONNRESET")
    )
  }

  if (dependency === "redis" || dependency === "cache") {
    return (
      message.includes("fetch failed") ||
      message.includes("ECONNRESET") ||
      message.includes("ETIMEDOUT") ||
      message.includes("ENOTFOUND") ||
      message.includes("network") ||
      message.includes("timeout")
    )
  }

  if (dependency === "payment") {
    return message.includes("timeout") || message.includes("ECONNRESET")
  }

  return false
}

export async function withDependencyGuard<T>(
  options: DependencyGuardOptions<T>
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS
  const retryable =
    options.retryable ?? ((error: unknown) => isTransientDependencyError(error, options.dependency))
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await withDependencyTimeout(options)
    } catch (error) {
      lastError = error
      const canRetry = retryable(error) && attempt < maxAttempts
      logDependencyFailure(options, error, attempt, maxAttempts, canRetry)

      if (!canRetry) {
        throw normalizeDependencyError(options, error)
      }

      await options.onRetry?.(error, attempt)
      await sleep((options.retryDelayMs ?? defaultRetryDelayMs)(attempt))
    }
  }

  throw normalizeDependencyError(options, lastError)
}

function withDependencyTimeout<T>(options: DependencyGuardOptions<T>): Promise<T> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_DEPENDENCY_TIMEOUT_MS
  let timeout: ReturnType<typeof setTimeout> | undefined

  // 所有外部依赖都必须有短超时，避免数据库或 Redis 抖动时拖住 Next route 执行线程。
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeout = setTimeout(() => {
      reject(
        new AppError(
          ErrorCodes.SERVICE_UNAVAILABLE,
          options.timeoutMessage ?? `${options.label} 操作超时，请稍后重试`,
          503,
          { dependency: options.dependency, label: options.label, timeoutMs },
          true
        )
      )
    }, timeoutMs)
  })

  return Promise.race([options.operation(), timeoutPromise]).finally(() => {
    if (timeout) clearTimeout(timeout)
  })
}

function normalizeDependencyError(options: DependencyGuardOptions<unknown>, error: unknown): unknown {
  if (error instanceof AppError) return error

  if (isTransientDependencyError(error, options.dependency)) {
    return new AppError(
      ErrorCodes.SERVICE_UNAVAILABLE,
      options.unavailableMessage ?? `${dependencyLabel(options.dependency)}暂时不可用，请稍后重试`,
      503,
      {
        dependency: options.dependency,
        label: options.label,
        error: formatDependencyError(error),
      },
      true
    )
  }

  return error
}

function logDependencyFailure(
  options: DependencyGuardOptions<unknown>,
  error: unknown,
  attempt: number,
  maxAttempts: number,
  willRetry: boolean
) {
  const log: DependencyErrorLog = {
    dependency: options.dependency,
    label: options.label,
    attempt,
    maxAttempts,
    code: getErrorCode(error),
    message: getErrorMessage(error),
  }

  console.warn(
    `[dependency-guard] ${willRetry ? "retrying" : "failed"} ${options.dependency}.${options.label}`,
    log
  )
}

function dependencyLabel(dependency: DependencyKind): string {
  if (dependency === "database") return "数据库连接"
  if (dependency === "redis" || dependency === "cache") return "缓存服务"
  if (dependency === "payment") return "支付服务"
  return "外部依赖"
}

function defaultRetryDelayMs(attempt: number): number {
  return attempt * 100
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined
  const code = "code" in error ? (error as { code?: unknown }).code : undefined
  return typeof code === "string" ? code : undefined
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string") return message
  }
  if (typeof error === "string") return error
  return "Unknown dependency error"
}

function formatDependencyError(error: unknown) {
  return {
    code: getErrorCode(error),
    message: getErrorMessage(error),
  }
}
