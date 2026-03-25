/**
 * ============================================
 * 统一错误处理模块 (v0.4.3)
 * ============================================
 * 功能说明：
 *   - 定义应用级错误类 AppError
 *   - 提供统一的错误码和状态码映射
 *   - 简化 API 错误处理流程
 * ============================================
 */

/**
 * 应用级错误类
 * 用于在 API 路由中抛出结构化的错误
 */
export class AppError extends Error {
  /**
   * 错误码 - 用于前端识别错误类型
   */
  public readonly code: string

  /**
   * HTTP 状态码
   */
  public readonly statusCode: number

  /**
   * 错误详情 - 可用于调试
   */
  public readonly details?: unknown

  /**
   * 是否应该记录到错误追踪 (如 Sentry)
   */
  public readonly shouldReport: boolean

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: unknown,
    shouldReport: boolean = true
  ) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.shouldReport = shouldReport

    // 确保原型链正确
    Object.setPrototypeOf(this, AppError.prototype)
  }

  /**
   * 将错误转换为 JSON 格式
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(process.env.NODE_ENV === "development" && { details: this.details }),
    }
  }
}

/**
 * 预定义的错误码
 * 使用常量可以避免拼写错误
 */
export const ErrorCodes = {
  // 通用错误 (1xxx)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  NOT_IMPLEMENTED: "NOT_IMPLEMENTED",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",

  // 认证授权错误 (2xxx)
  UNAUTHORIZED: "UNAUTHORIZED",
  UNAUTHORIZED_TOKEN_EXPIRED: "UNAUTHORIZED_TOKEN_EXPIRED",
  UNAUTHORIZED_TOKEN_INVALID: "UNAUTHORIZED_TOKEN_INVALID",
  FORBIDDEN: "FORBIDDEN",
  FORBIDDEN_PERMISSION: "FORBIDDEN_PERMISSION",

  // 资源错误 (3xxx)
  NOT_FOUND: "NOT_FOUND",
  NOT_FOUND_RESOURCE: "NOT_FOUND_RESOURCE",
  CONFLICT: "CONFLICT",
  CONFLICT_DUPLICATE: "CONFLICT_DUPLICATE",

  // 参数错误 (4xxx)
  BAD_REQUEST: "BAD_REQUEST",
  BAD_REQUEST_VALIDATION: "BAD_REQUEST_VALIDATION",
  BAD_REQUEST_MISSING_FIELD: "BAD_REQUEST_MISSING_FIELD",
  BAD_REQUEST_INVALID_FORMAT: "BAD_REQUEST_INVALID_FORMAT",

  // 业务逻辑错误 (5xxx)
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  COUPON_EXPIRED: "COUPON_EXPIRED",
  COUPON_INVALID: "COUPON_INVALID",
  COUPON_ALREADY_USED: "COUPON_ALREADY_USED",
  POINTS_INSUFFICIENT: "POINTS_INSUFFICIENT",
  ORDER_CANNOT_CANCEL: "ORDER_CANNOT_CANCEL",
  ORDER_ALREADY_PAID: "ORDER_ALREADY_PAID",
} as const

/**
 * 错误码到状态码的映射
 */
export const StatusCodeMap: Record<string, number> = {
  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.NOT_IMPLEMENTED]: 501,
  [ErrorCodes.SERVICE_UNAVAILABLE]: 503,

  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.UNAUTHORIZED_TOKEN_EXPIRED]: 401,
  [ErrorCodes.UNAUTHORIZED_TOKEN_INVALID]: 401,
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.FORBIDDEN_PERMISSION]: 403,

  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.NOT_FOUND_RESOURCE]: 404,
  [ErrorCodes.CONFLICT]: 409,
  [ErrorCodes.CONFLICT_DUPLICATE]: 409,

  [ErrorCodes.BAD_REQUEST]: 400,
  [ErrorCodes.BAD_REQUEST_VALIDATION]: 400,
  [ErrorCodes.BAD_REQUEST_MISSING_FIELD]: 400,
  [ErrorCodes.BAD_REQUEST_INVALID_FORMAT]: 400,

  [ErrorCodes.INSUFFICIENT_STOCK]: 422,
  [ErrorCodes.COUPON_EXPIRED]: 422,
  [ErrorCodes.COUPON_INVALID]: 422,
  [ErrorCodes.COUPON_ALREADY_USED]: 422,
  [ErrorCodes.POINTS_INSUFFICIENT]: 422,
  [ErrorCodes.ORDER_CANNOT_CANCEL]: 422,
  [ErrorCodes.ORDER_ALREADY_PAID]: 422,
}

/**
 * 创建常用错误的工厂函数
 */

// 400 Bad Request
export const badRequest = (
  message: string = "请求参数错误",
  details?: unknown
): AppError =>
  new AppError(ErrorCodes.BAD_REQUEST, message, 400, details, false)

// 401 Unauthorized
export const unauthorized = (
  message: string = "未登录或登录已过期",
  code: string = ErrorCodes.UNAUTHORIZED
): AppError =>
  new AppError(code, message, 401, undefined, false)

// 403 Forbidden
export const forbidden = (
  message: string = "没有权限执行此操作"
): AppError =>
  new AppError(ErrorCodes.FORBIDDEN_PERMISSION, message, 403, undefined, false)

// 404 Not Found
export const notFound = (
  resource: string = "资源"
): AppError =>
  new AppError(
    ErrorCodes.NOT_FOUND_RESOURCE,
    `${resource}不存在或已被删除`,
    404,
    undefined,
    false
  )

// 409 Conflict
export const conflict = (
  message: string = "资源冲突"
): AppError =>
  new AppError(ErrorCodes.CONFLICT, message, 409, undefined, false)

// 422 业务逻辑错误
export const unprocessable = (
  code: string,
  message: string,
  details?: unknown
): AppError =>
  new AppError(code, message, StatusCodeMap[code] || 422, details, false)

// 500 内部错误
export const internalError = (
  message: string = "服务器内部错误",
  details?: unknown
): AppError =>
  new AppError(ErrorCodes.INTERNAL_ERROR, message, 500, details, true)

// 503 服务不可用
export const serviceUnavailable = (
  message: string = "服务暂时不可用"
): AppError =>
  new AppError(ErrorCodes.SERVICE_UNAVAILABLE, message, 503, undefined, true)