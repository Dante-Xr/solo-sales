/**
 * ============================================
 * 前端权限 Hook (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 获取当前用户权限
 *   - 检查用户权限
 *   - 定期刷新权限
 *   - 权限变更通知
 * ============================================
 */

"use client"

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react"

interface AdminInfo {
  id: string
  username: string
  email: string
  role: {
    id: string
    name: string
    label: string
  }
  permissions: string[]
  lastLoginAt?: string
}

interface PermissionContextType {
  admin: AdminInfo | null
  permissions: string[]
  isLoading: boolean
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const PermissionContext = createContext<PermissionContextType | null>(null)

const PERMISSION_REFRESH_INTERVAL = 5 * 60 * 1000

export function PermissionProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchAdminInfo = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auth/me")
      const data = await res.json()
      if (data.success) {
        setAdmin(data.data)
      } else {
        setAdmin(null)
      }
    } catch (error) {
      console.error("获取管理员信息失败:", error)
      setAdmin(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAdminInfo()

    const interval = setInterval(fetchAdminInfo, PERMISSION_REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [fetchAdminInfo])

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!admin) return false
      if (admin.permissions.includes("*")) return true
      return admin.permissions.includes(permission)
    },
    [admin]
  )

  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      if (!admin) return false
      if (admin.permissions.includes("*")) return true
      return permissions.some((p) => admin.permissions.includes(p))
    },
    [admin]
  )

  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      if (!admin) return false
      if (admin.permissions.includes("*")) return true
      return permissions.every((p) => admin.permissions.includes(p))
    },
    [admin]
  )

  const refresh = useCallback(async () => {
    await fetchAdminInfo()
  }, [fetchAdminInfo])

  const logout = useCallback(async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "PUT" })
      setAdmin(null)
      window.location.href = "/admin/login"
    } catch (error) {
      console.error("登出失败:", error)
    }
  }, [])

  return (
    <PermissionContext.Provider
      value={{
        admin,
        permissions: admin?.permissions || [],
        isLoading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        refresh,
        logout,
      }}
    >
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider")
  }
  return context
}

export function useHasPermission(permission: string) {
  const { hasPermission } = usePermissions()
  return hasPermission(permission)
}

export function useHasAnyPermission(permissions: string[]) {
  const { hasAnyPermission } = usePermissions()
  return hasAnyPermission(permissions)
}

export function useHasAllPermissions(permissions: string[]) {
  const { hasAllPermissions } = usePermissions()
  return hasAllPermissions(permissions)
}