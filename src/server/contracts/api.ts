/**
 * 修改时间：2026-05-02 21:14:38 +08:00
 * 修改内容：扩展统一 API 响应契约支持兼容顶层字段，便于健康检查和 CSRF route 平滑迁移。
 * 修改模型：gpt-5.5
 */
import "server-only"

import { NextResponse } from "next/server"
import { AppError, ErrorCodes } from "./errors"

export interface ApiErrorBody {
  code: string
  message: string
  details?: unknown
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiErrorBody
  meta?: Record<string, unknown>
}

export function successResponse<T>(
  data: T,
  options?: {
    status?: number
    meta?: Record<string, unknown>
    fromCache?: boolean
    headers?: HeadersInit
    topLevel?: object
  }
): NextResponse<ApiResponse<T>> {
  // 统一把扩展信息放进 meta，保留 fromCache 兼容旧调用方。
  const meta = {
    ...options?.meta,
    ...(options?.fromCache ? { fromCache: true } : {}),
  }

  return NextResponse.json(
    {
      success: true,
      data,
      // 少数外部约定接口需要保留顶层字段；新调用方仍优先读取 data。
      ...options?.topLevel,
      ...(Object.keys(meta).length > 0 ? { meta } : {}),
      ...(options?.fromCache ? { fromCache: true } : {}),
    },
    { status: options?.status ?? 200, headers: options?.headers }
  )
}

export function createdResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return successResponse(data, { status: 201 })
}

export function errorResponse(
  error: AppError | ApiErrorBody | string,
  status = 500,
  options?: { headers?: HeadersInit }
): NextResponse<ApiResponse> {
  if (error instanceof AppError) {
    // 业务错误也允许透传 headers，保证 CORS 路由的成功和失败响应一致。
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(process.env.NODE_ENV === "development" && { details: error.details }),
        },
      },
      { status: error.statusCode, headers: options?.headers }
    )
  }

  const body =
    typeof error === "string"
      ? { code: ErrorCodes.INTERNAL_ERROR, message: error }
      : error

  return NextResponse.json(
    {
      success: false,
      error: {
        code: body.code,
        message: body.message,
        ...(process.env.NODE_ENV === "development" && body.details !== undefined
          ? { details: body.details }
          : {}),
      },
    },
    { status, headers: options?.headers }
  )
}

export function handleApiError(
  error: unknown,
  options?: { headers?: HeadersInit }
): NextResponse<ApiResponse> {
  // AppError 是业务可预期错误，按自身状态码返回；未知错误统一收敛为 500。
  if (error instanceof AppError) {
    if (error.shouldReport) {
      console.error(`[API Error] ${error.code}: ${error.message}`, error.details)
    }
    return errorResponse(error, error.statusCode, options)
  }

  console.error("[API Error] Unexpected:", error)

  return errorResponse(
    {
      code: ErrorCodes.INTERNAL_ERROR,
      message: "服务器内部错误",
      details: error instanceof Error ? error.message : error,
    },
    500,
    options
  )
}
