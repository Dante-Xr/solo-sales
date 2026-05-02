/**
 * 修改时间：2026-05-02 19:00:54 +08:00
 * 修改内容：适配标准 API 响应模型，统一 Refine DataProvider 的成功解包、错误解析和列表分页 total 计算。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * Refine 数据提供者 (Phase 5 管理后台重构)
 * ============================================
 * 创建日期: 2026-04-13
 * 创建时间: 22:00
 * 功能说明：
 *   - 封装现有管理后台 API 为 Refine DataProvider 接口
 *   - 支持列表、详情、创建、更新、删除操作
 *   - 支持分页、排序、筛选
 * ============================================
 */

import type { DataProvider } from "@refinedev/core"

const API_URL = "/api/admin"

interface StandardApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string | {
    code?: string
    message?: string
    details?: unknown
  }
}

interface ListPayload<T = unknown> {
  list?: T[]
  data?: T[]
  pagination?: {
    total?: number
  }
  total?: number
}

function isStandardApiResponse<T>(data: unknown): data is StandardApiResponse<T> {
  return (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    typeof (data as { success: unknown }).success === "boolean"
  )
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object" || !("error" in data)) return fallback

  const error = (data as { error: unknown }).error
  if (typeof error === "string") return error
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message)
  }

  return fallback
}

function unwrapApiResponse<T>(data: unknown): T {
  if (!isStandardApiResponse<T>(data)) return data as T
  if (!data.success) throw new Error(getErrorMessage(data, "API Error"))

  // 标准响应只向 Refine 暴露业务 data，避免页面层重复判断 success/data。
  return data.data as T
}

function normalizeListPayload<T>(payload: ListPayload<T> | T[]) {
  if (Array.isArray(payload)) {
    return {
      data: payload,
      total: payload.length,
    }
  }

  const data = payload.list ?? payload.data ?? []
  return {
    data,
    total: payload.pagination?.total ?? payload.total ?? data.length,
  }
}

export const fetchApi = async <T = unknown>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(getErrorMessage(error, `API Error: ${response.status}`))
  }

  return unwrapApiResponse<T>(await response.json())
}

const getList: NonNullable<DataProvider["getList"]> = async ({
  resource,
  pagination,
  sorters,
  filters,
}) => {
  const params = new URLSearchParams()

  if (pagination) {
    params.set("page", String(pagination.currentPage || 1))
    params.set("pageSize", String(pagination.pageSize || 10))
  }

  if (sorters && sorters.length > 0) {
    params.set("sortBy", sorters[0].field)
    params.set("sortOrder", sorters[0].order)
  }

  if (filters && filters.length > 0) {
    filters.forEach((filter) => {
      if ("field" in filter && filter.field) {
        params.set(filter.field, String(filter.value))
      }
    })
  }

  const result = await fetchApi<ListPayload | unknown[]>(`${API_URL}/${resource}?${params.toString()}`)
  const normalized = normalizeListPayload(result)

  return {
    data: normalized.data as never[],
    total: normalized.total,
  }
}

const getOne: NonNullable<DataProvider["getOne"]> = async ({ resource, id }) => {
  const result = await fetchApi(`${API_URL}/${resource}/${id}`)
  return {
    data: result as never,
  }
}

const create: NonNullable<DataProvider["create"]> = async ({ resource, variables }) => {
  const result = await fetchApi(`${API_URL}/${resource}`, {
    method: "POST",
    body: JSON.stringify(variables),
  })
  return {
    data: result as never,
  }
}

const update: NonNullable<DataProvider["update"]> = async ({ resource, id, variables }) => {
  const result = await fetchApi(`${API_URL}/${resource}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(variables),
  })
  return {
    data: result as never,
  }
}

const deleteOne: NonNullable<DataProvider["deleteOne"]> = async ({ resource, id }) => {
  const result = await fetchApi(`${API_URL}/${resource}/${id}`, {
    method: "DELETE",
  })
  return {
    data: result as never,
  }
}

const custom: NonNullable<DataProvider["custom"]> = async ({
  url,
  method,
  filters,
  sorters,
  payload,
  query,
  headers,
}) => {
  // Refine custom 会传入 filters/sorters；当前后台自定义接口只使用 query 显式参数。
  void filters
  void sorters

  let requestUrl = `${url}`
  if (query) {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      params.set(key, String(value))
    })
    requestUrl = `${url}?${params.toString()}`
  }

  const result = await fetchApi(requestUrl, {
    method: method || "GET",
    body: payload ? JSON.stringify(payload) : undefined,
    headers: headers as Record<string, string> | undefined,
  })

  return {
    data: result as never,
  }
}

export const dataProvider: DataProvider = {
  getList,
  getOne,
  create,
  update,
  deleteOne,
  getApiUrl: () => API_URL,
  custom,
}
