/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：兼容标准 API 响应模型，成功自动解包 data，错误支持结构化 message。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * API 客户端工具 (Phase 1 零成本修复)
 * ============================================
 * 功能说明：
 *   - 为 TanStack Query 提供统一的 API 请求工具
 *   - 替代手动 fetch 调用
 *   - 自动处理错误和响应解析
 *
 * 使用方式：
 *   import { apiFetch } from "@/lib/api-client"
 *   const data = await apiFetch<User[]>("/api/users")
 * ============================================
 */

const API_BASE = ""

/**
 * API 错误类
 * 包含 HTTP 状态码和响应数据
 */
export class ApiError extends Error {
  status: number    // HTTP 状态码（如 400, 401, 500）
  data: unknown      // 服务器返回的错误数据

  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.status = status
    this.data = data
  }
}

interface StandardApiResponse<T> {
  success: boolean
  data?: T
  error?: string | {
    code?: string
    message?: string
    details?: unknown
  }
}

function isStandardApiResponse<T>(data: unknown): data is StandardApiResponse<T> {
  // 新旧 API 迁移期：只有带 success 布尔值的响应才按标准模型解包。
  return (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    typeof (data as { success: unknown }).success === "boolean"
  )
}

function getErrorMessage(data: unknown, fallback: string): string {
  // 兼容旧格式 { error: string } 和新格式 { error: { message } }。
  if (!data || typeof data !== "object" || !("error" in data)) {
    return fallback
  }

  const error = (data as { error: unknown }).error

  if (typeof error === "string") {
    return error
  }

  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message)
  }

  return fallback
}

/**
 * 统一 API 请求函数
 *
 * @param endpoint - API 端点（如 "/api/products"）
 * @param options - 可选的 fetch 配置
 * @returns 解析后的 JSON 数据
 *
 * 功能：
 *   - 自动添加 Content-Type header
 *   - 非 2xx 状态码抛出 ApiError
 *   - 自动解析 JSON 响应
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",  // 默认 JSON 格式
      ...options?.headers,                   // 合并自定义 headers
    },
    ...options,  // 合并其他 fetch 选项（method, body 等）
  })

  // 非成功状态码，抛出错误
  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new ApiError(
      res.status,
      getErrorMessage(errorData, `API Error: ${res.status}`),
      errorData
    )
  }

  const data = await res.json()

  if (isStandardApiResponse<T>(data)) {
    // 成功响应只把 data 暴露给调用方，避免业务代码散落 response.data 解包逻辑。
    if (!data.success) {
      throw new ApiError(res.status, getErrorMessage(data, "API Error"), data)
    }

    return data.data as T
  }

  return data
}
