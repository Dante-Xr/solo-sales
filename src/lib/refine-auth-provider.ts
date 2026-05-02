/**
 * 修改时间：2026-05-02 21:02:01 +08:00
 * 修改内容：兼容管理员认证标准错误响应，避免结构化 error 直接作为登录错误文案。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * Refine 认证提供者 (Phase 5 管理后台重构)
 * ============================================
 * 创建日期: 2026-04-13
 * 创建时间: 22:05
 * 功能说明：
 *   - 封装管理后台认证逻辑为 Refine AuthProvider 接口
 *   - 支持登录、登出、检查认证状态、获取用户身份
 *   - 权限检查功能
 * ============================================
 */

import type { AuthProvider } from "@refinedev/core"

function getApiErrorMessage(result: { error?: unknown }, fallback: string): string {
  // 兼容旧字符串错误和新标准 { error: { message } }，保证 Refine 登录页只接收字符串。
  if (typeof result.error === "string") {
    return result.error
  }

  if (
    result.error &&
    typeof result.error === "object" &&
    "message" in result.error &&
    typeof result.error.message === "string"
  ) {
    return result.error.message
  }

  return fallback
}

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (result.success) {
        return {
          success: true,
          redirectTo: "/admin",
        }
      }

      return {
        success: false,
        error: {
          message: getApiErrorMessage(result, "Login failed"),
          name: "LoginError",
        },
      }
    } catch {
      return {
        success: false,
        error: {
          message: "Network error",
          name: "NetworkError",
        },
      }
    }
  },

  logout: async () => {
    try {
      await fetch("/api/admin/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      })
    } catch {
      // 忽略登出错误
    }

    return {
      success: true,
      redirectTo: "/admin/login",
    }
  },

  check: async () => {
    try {
      const response = await fetch("/api/admin/auth/me")
      const result = await response.json()

      if (result.success) {
        return {
          authenticated: true,
        }
      }
    } catch {
      // 忽略检查错误
    }

    return {
      authenticated: false,
      redirectTo: "/admin/login",
    }
  },

  getIdentity: async () => {
    try {
      const response = await fetch("/api/admin/auth/me")
      const result = await response.json()

      if (result.success) {
        return {
          id: result.data.id,
          name: result.data.username,
          email: result.data.email,
          role: result.data.role,
          permissions: result.data.permissions || [],
        }
      }
    } catch {
      // 忽略获取身份错误
    }

    return null
  },

  onError: async (error) => {
    if (error?.status === 401) {
      return {
        logout: true,
        redirectTo: "/admin/login",
      }
    }

    return { error }
  },
}
