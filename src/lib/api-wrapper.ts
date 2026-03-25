/**
 * ============================================
 * API 处理器包装器 (v0.4.3)
 * ============================================
 * 功能说明：
 *   - 统一处理 API 路由的错误捕获
 *   - 提供标准化的响应格式
 *   - 支持可选的认证检查
 *   - 支持可选的权限检查
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { AppError, ErrorCodes } from "./errors"
import { getAdminPermissions, verifyAdminToken } from "./adminAuth"

/**
 * API 响应类型
 */
interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  fromCache?: boolean
}

/**
 * API 处理器函数类型
 */
type ApiHandler<T = unknown> = (
  request: NextRequest,
  context?: ApiContext
) => Promise<NextResponse<ApiResponse<T>>>

/**
 * API 上下文
 */
interface ApiContext {
  admin?: {
    id: string
    username: string
    email: string
  }
  params?: Record<string, string>
}

/**
 * API 包装器选项
 */
interface WithOptions {
  /** 是否需要管理员认证 */
  requireAuth?: boolean
  /** 是否需要超级管理员权限 */
  requireSuperAdmin?: boolean
  /** 需要的权限列表 (满足其一即可) */
  permissions?: string[]
  /** 是否只允许 GET 请求 */
  allowGetOnly?: boolean
}

/**
 * 将错误转换为 API 响应
 */
function handleError(error: unknown): NextResponse<ApiResponse> {
  // 如果是 AppError，使用其信息
  if (error instanceof AppError) {
    console.error(`[API Error] ${error.code}: ${error.message}`, error.details)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(process.env.NODE_ENV === "development" && { details: error.details }),
        },
      },
      { status: error.statusCode }
    )
  }

  // 处理其他错误
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred"
  console.error("[API Error] Unexpected:", error)

  return NextResponse.json(
    {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message,
      },
    },
    { status: 500 }
  )
}

/**
 * 创建标准化的成功响应
 */
export function successResponse<T>(
  data: T,
  options?: { fromCache?: boolean }
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(options?.fromCache && { fromCache: true }),
    },
    { status: 200 }
  )
}

/**
 * 创建标准化的创建成功响应 (201)
 */
export function createdResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: 201 }
  )
}

/**
 * API 包装器
 * 用于统一处理认证、权限和错误
 */
export function withApiHandler<T = unknown>(
  handler: ApiHandler<T>,
  options: WithOptions = {}
): (request: NextRequest, context?: { params?: Record<string, string> }) => Promise<NextResponse<ApiResponse<T>>> {
  return async (request: NextRequest, context?: { params?: Record<string, string> }) => {
    try {
      // 检查请求方法
      if (options.allowGetOnly && request.method !== "GET") {
        throw new AppError(
          ErrorCodes.BAD_REQUEST,
          "此接口只支持 GET 请求",
          405
        )
      }

      // 初始化上下文
      const apiContext: ApiContext = {
        params: context?.params,
      }

      // 认证检查
      if (options.requireAuth) {
        const admin = await verifyAdminToken(request)
        if (!admin) {
          throw new AppError(
            ErrorCodes.UNAUTHORIZED,
            "请先登录",
            401
          )
        }
        apiContext.admin = admin

        // 超级管理员检查
        if (options.requireSuperAdmin && admin.username !== "admin") {
          throw new AppError(
            ErrorCodes.FORBIDDEN,
            "需要超级管理员权限",
            403
          )
        }

        // 权限检查
        if (options.permissions && options.permissions.length > 0) {
          const adminPermissions = await getAdminPermissions(admin.id)
          const hasPermission = options.permissions.some(
            (p) => adminPermissions.includes("*") || adminPermissions.includes(p)
          )
          if (!hasPermission) {
            throw new AppError(
              ErrorCodes.FORBIDDEN_PERMISSION,
              "没有执行此操作的权限",
              403
            )
          }
        }
      }

      // 执行处理器
      return await handler(request, apiContext)
    } catch (error) {
      return handleError(error) as NextResponse<ApiResponse<T>>
    }
  }
}

/**
 * 快速创建 GET 处理器
 */
export function withGet<T = unknown>(
  handler: (request: NextRequest, context?: ApiContext) => Promise<NextResponse<ApiResponse<T>>>
) {
  return withApiHandler(handler, { allowGetOnly: true })
}

/**
 * 快速创建需要认证的 GET 处理器
 */
export function withAuthGet<T = unknown>(
  handler: (request: NextRequest, context?: ApiContext) => Promise<NextResponse<ApiResponse<T>>>,
  options?: { permissions?: string[] }
) {
  return withApiHandler(handler, {
    requireAuth: true,
    allowGetOnly: true,
    ...options,
  })
}

/**
 * 快速创建需要认证的 POST 处理器
 */
export function withAuthPost<T = unknown>(
  handler: (request: NextRequest, context?: ApiContext) => Promise<NextResponse<ApiResponse<T>>>,
  options?: { permissions?: string[] }
) {
  return withApiHandler(handler, { requireAuth: true, ...options })
}

/**
 * 快速创建需要认证且需要特定权限的处理器
 */
export function withPermission<T = unknown>(
  permissions: string[],
  handler: (request: NextRequest, context?: ApiContext) => Promise<NextResponse<ApiResponse<T>>>
) {
  return withApiHandler(handler, { requireAuth: true, permissions })
}