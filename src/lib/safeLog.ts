/**
 * ============================================
 * 日志脱敏工具模块 (v0.5.9)
 * ============================================
 * 功能说明：
 *   - 脱敏敏感数据后再记录日志
 *   - 防止敏感信息泄露到日志
 * ============================================
 */

/**
 * 常见的敏感字段
 */
const SENSITIVE_FIELDS = [
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "apiKey",
  "apikey",
  "privateKey",
  "authorization",
  "cookie",
  "session",
  "creditCard",
  "cardNumber",
  "cvv",
  "ssn",
  "phone",
  "email",
  "address",
  "name",
  "fullName",
]

/**
 * 从对象中移除敏感字段
 */
function sanitizeObject(obj: unknown, depth: number = 0): unknown {
  if (depth > 5) return "[MAX_DEPTH]"

  if (obj === null || obj === undefined) return obj

  if (typeof obj === "string") {
    return obj.length > 100 ? obj.slice(0, 100) + "..." : obj
  }

  if (typeof obj === "number" || typeof obj === "boolean") return obj

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, depth + 1))
  }

  if (typeof obj === "object") {
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase()

      if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field))) {
        sanitized[key] = "[REDACTED]"
      } else if (typeof value === "object") {
        sanitized[key] = sanitizeObject(value, depth + 1)
      } else {
        sanitized[key] = value
      }
    }
    return sanitized
  }

  return obj
}

/**
 * 安全的错误日志记录
 * 只记录错误消息，不记录完整堆栈或敏感数据
 */
export function safeErrorLog(context: string, error: unknown): void {
  if (process.env.NODE_ENV === "test") return

  const errorMessage = error instanceof Error
    ? error.message
    : typeof error === "string"
      ? error
      : "Unknown error"

  const sanitizedError = error instanceof Error
    ? { name: error.name, message: errorMessage }
    : { message: errorMessage }

  console.error(`[ERROR] ${context}:`, sanitizedError)
}

/**
 * 安全的调试日志记录
 * 开发环境下记录更多细节，但不包含敏感信息
 */
export function safeDebugLog(context: string, data?: unknown): void {
  if (process.env.NODE_ENV !== "development") return

  if (data === undefined) {
    console.log(`[DEBUG] ${context}`)
  } else {
    const sanitized = sanitizeObject(data)
    console.log(`[DEBUG] ${context}:`, sanitized)
  }
}

/**
 * 安全的警告日志
 */
export function safeWarnLog(context: string, message: string): void {
  console.warn(`[WARN] ${context}: ${message}`)
}
