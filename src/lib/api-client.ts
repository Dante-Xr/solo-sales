/**
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
      // 尝试从响应中提取 error 字段
      errorData && typeof errorData === "object" && "error" in errorData
        ? String((errorData as { error: string }).error)
        : `API Error: ${res.status}`,
      errorData
    )
  }

  // 成功响应，返回解析后的 JSON
  return res.json()
}
