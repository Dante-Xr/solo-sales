/**
 * 错误处理工具
 * 提供类型安全的错误处理函数和类型守卫
 */

/**
 * Catch 块中的错误类型
 * TypeScript catch 块中的错误默认为 unknown
 */
export type CatchError = unknown

/**
 * 类型守卫：检查是否为 Error 实例
 * @param error 未知类型的错误对象
 * @returns 如果是 Error 实例则返回 true
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error
}

/**
 * 从未知错误对象中提取错误消息
 * @param error 未知类型的错误对象
 * @returns 错误消息字符串
 */
export function getErrorMessage(error: unknown): string {
  // Standard Error instance
  if (isError(error)) {
    return error.message
  }

  // String error
  if (typeof error === 'string') {
    return error
  }

  // Object with message property
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  // Unknown error type
  return 'An unknown error occurred'
}

/**
 * 从错误对象中提取堆栈跟踪
 * @param error 未知类型的错误对象
 * @returns 堆栈跟踪字符串，如果不可用则返回 undefined
 */
export function getErrorStack(error: unknown): string | undefined {
  if (isError(error)) {
    return error.stack
  }
  return undefined
}
