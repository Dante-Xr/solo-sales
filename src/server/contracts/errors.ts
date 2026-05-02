/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：新增统一错误码、HTTP 状态码映射和 AppError 工厂方法。
 * 修改模型：gpt-5.5
 */
import "server-only"

export const ErrorCodes = {
  INTERNAL_ERROR: "INTERNAL_ERROR",
  NOT_IMPLEMENTED: "NOT_IMPLEMENTED",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  PAYMENT_CONFIGURATION_ERROR: "PAYMENT_CONFIGURATION_ERROR",
  PAYMENT_PROVIDER_ERROR: "PAYMENT_PROVIDER_ERROR",
  PAYMENT_WEBHOOK_SIGNATURE_ERROR: "PAYMENT_WEBHOOK_SIGNATURE_ERROR",

  UNAUTHORIZED: "UNAUTHORIZED",
  UNAUTHORIZED_TOKEN_EXPIRED: "UNAUTHORIZED_TOKEN_EXPIRED",
  UNAUTHORIZED_TOKEN_INVALID: "UNAUTHORIZED_TOKEN_INVALID",
  FORBIDDEN: "FORBIDDEN",
  FORBIDDEN_PERMISSION: "FORBIDDEN_PERMISSION",

  NOT_FOUND: "NOT_FOUND",
  NOT_FOUND_RESOURCE: "NOT_FOUND_RESOURCE",
  CONFLICT: "CONFLICT",
  CONFLICT_DUPLICATE: "CONFLICT_DUPLICATE",

  BAD_REQUEST: "BAD_REQUEST",
  BAD_REQUEST_VALIDATION: "BAD_REQUEST_VALIDATION",
  BAD_REQUEST_MISSING_FIELD: "BAD_REQUEST_MISSING_FIELD",
  BAD_REQUEST_INVALID_FORMAT: "BAD_REQUEST_INVALID_FORMAT",

  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  COUPON_EXPIRED: "COUPON_EXPIRED",
  COUPON_INVALID: "COUPON_INVALID",
  COUPON_ALREADY_USED: "COUPON_ALREADY_USED",
  POINTS_INSUFFICIENT: "POINTS_INSUFFICIENT",
  ORDER_CANNOT_CANCEL: "ORDER_CANNOT_CANCEL",
  ORDER_ALREADY_PAID: "ORDER_ALREADY_PAID",
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

export const StatusCodeMap: Record<ErrorCode, number> = {
  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.NOT_IMPLEMENTED]: 501,
  [ErrorCodes.SERVICE_UNAVAILABLE]: 503,
  [ErrorCodes.PAYMENT_CONFIGURATION_ERROR]: 500,
  [ErrorCodes.PAYMENT_PROVIDER_ERROR]: 502,
  [ErrorCodes.PAYMENT_WEBHOOK_SIGNATURE_ERROR]: 400,

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

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly details?: unknown
  public readonly shouldReport: boolean

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = StatusCodeMap[code] ?? 500,
    details?: unknown,
    shouldReport = statusCode >= 500
  ) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.shouldReport = shouldReport
    Object.setPrototypeOf(this, AppError.prototype)
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(process.env.NODE_ENV === "development" && { details: this.details }),
    }
  }
}

export const badRequest = (message = "请求参数错误", details?: unknown): AppError =>
  new AppError(ErrorCodes.BAD_REQUEST, message, 400, details, false)

export const validationError = (
  message = "请求参数验证失败",
  details?: unknown
): AppError =>
  new AppError(ErrorCodes.BAD_REQUEST_VALIDATION, message, 400, details, false)

export const unauthorized = (
  message = "未登录或登录已过期",
  code: ErrorCode = ErrorCodes.UNAUTHORIZED
): AppError => new AppError(code, message, 401, undefined, false)

export const forbidden = (message = "没有权限执行此操作"): AppError =>
  new AppError(ErrorCodes.FORBIDDEN_PERMISSION, message, 403, undefined, false)

export const notFound = (resource = "资源"): AppError =>
  new AppError(
    ErrorCodes.NOT_FOUND_RESOURCE,
    `${resource}不存在或已被删除`,
    404,
    undefined,
    false
  )

export const conflict = (message = "资源冲突"): AppError =>
  new AppError(ErrorCodes.CONFLICT, message, 409, undefined, false)

export const unprocessable = (
  code: ErrorCode,
  message: string,
  details?: unknown
): AppError => new AppError(code, message, StatusCodeMap[code] || 422, details, false)

export const internalError = (
  message = "服务器内部错误",
  details?: unknown
): AppError => new AppError(ErrorCodes.INTERNAL_ERROR, message, 500, details, true)

export const serviceUnavailable = (message = "服务暂时不可用"): AppError =>
  new AppError(ErrorCodes.SERVICE_UNAVAILABLE, message, 503, undefined, true)
