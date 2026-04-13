/**
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

const fetchApi = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `API Error: ${response.status}`)
  }

  return response.json()
}

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, sorters, filters }) => {
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

    const result = await fetchApi(`${API_URL}/${resource}?${params.toString()}`)

    return {
      data: result.data || [],
      total: result.total || result.data?.length || 0,
    }
  },

  getOne: async ({ resource, id }) => {
    const result = await fetchApi(`${API_URL}/${resource}/${id}`)
    return {
      data: result.data,
    }
  },

  create: async ({ resource, variables }) => {
    const result = await fetchApi(`${API_URL}/${resource}`, {
      method: "POST",
      body: JSON.stringify(variables),
    })
    return {
      data: result.data,
    }
  },

  update: async ({ resource, id, variables }) => {
    const result = await fetchApi(`${API_URL}/${resource}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(variables),
    })
    return {
      data: result.data,
    }
  },

  deleteOne: async ({ resource, id }) => {
    const result = await fetchApi(`${API_URL}/${resource}/${id}`, {
      method: "DELETE",
    })
    return {
      data: result.data,
    }
  },

  getApiUrl: () => API_URL,

  custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
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
      data: result,
    }
  },
}