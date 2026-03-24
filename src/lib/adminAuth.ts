/**
 * ============================================
 * 管理员权限校验核心库 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 验证管理员 Token
 *   - 获取用户权限（带缓存）
 *   - 检查用户权限
 *   - 权限缓存管理
 *   - API 权限校验中间件
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from "./cache"

const prisma = new PrismaClient()

const ADMIN_COOKIE_NAME = "admin_token"

const CACHE_TTL = {
  ADMIN_PERMISSIONS: 300,
  ROLE_PERMISSIONS: 600,
  ALL_PERMISSIONS: 1800,
} as const

export interface AdminInfo {
  id: string
  username: string
  email: string
  role: {
    id: string
    name: string
    label: string
  }
  permissions: string[]
}

interface TokenPayload {
  adminId: string
  timestamp: number
  random: string
}

function generateToken(adminId: string): string {
  const payload: TokenPayload = {
    adminId,
    timestamp: Date.now(),
    random: Math.random().toString(36).substring(2),
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

function parseToken(token: string): TokenPayload | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    return JSON.parse(decoded) as TokenPayload
  } catch {
    return null
  }
}

export async function verifyAdminToken(request: NextRequest): Promise<AdminInfo | null> {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value

    if (!token) {
      return null
    }

    const tokenData = parseToken(token)
    if (!tokenData) {
      return null
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: tokenData.adminId },
      include: {
        role: {
          include: {
            permissions: {
              select: { name: true },
            },
          },
        },
      },
    })

    if (!admin || !admin.isActive) {
      return null
    }

    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: {
        id: admin.role.id,
        name: admin.role.name,
        label: admin.role.label,
      },
      permissions: admin.role.permissions.map((p) => p.name),
    }
  } catch (error) {
    console.error("verifyAdminToken error:", error)
    return null
  }
}

export async function getAdminPermissions(adminId: string): Promise<string[]> {
  const cacheKey = `admin:permissions:${adminId}`

  const cached = await cacheGet<string[]>(cacheKey)
  if (cached) {
    return cached
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId },
    include: {
      role: {
        include: {
          permissions: {
            select: { name: true },
          },
        },
      },
    },
  })

  if (!admin) {
    return []
  }

  const permissions = admin.role.permissions.map((p) => p.name)

  await cacheSet(cacheKey, permissions, CACHE_TTL.ADMIN_PERMISSIONS)

  return permissions
}

export async function hasPermission(adminId: string, permission: string): Promise<boolean> {
  if (adminId === "system") {
    return true
  }

  const permissions = await getAdminPermissions(adminId)

  if (permissions.includes("*")) {
    return true
  }

  return permissions.includes(permission)
}

export async function hasAnyPermission(
  adminId: string,
  permissions: string[]
): Promise<boolean> {
  if (adminId === "system") {
    return true
  }

  const userPermissions = await getAdminPermissions(adminId)

  if (userPermissions.includes("*")) {
    return true
  }

  return permissions.some((p) => userPermissions.includes(p))
}

export async function hasAllPermissions(
  adminId: string,
  permissions: string[]
): Promise<boolean> {
  if (adminId === "system") {
    return true
  }

  const userPermissions = await getAdminPermissions(adminId)

  if (userPermissions.includes("*")) {
    return true
  }

  return permissions.every((p) => userPermissions.includes(p))
}

export async function invalidatePermissionCache(adminId: string): Promise<void> {
  const cacheKey = `admin:permissions:${adminId}`
  await cacheDel(cacheKey)
}

export async function invalidateRoleCache(roleId: string): Promise<void> {
  const cacheKey = `role:permissions:${roleId}`
  await cacheDel(cacheKey)

  const admins = await prisma.adminUser.findMany({
    where: { roleId },
    select: { id: true },
  })

  await Promise.all(admins.map((admin) => invalidatePermissionCache(admin.id)))
}

export async function invalidateAllPermissionsCache(): Promise<void> {
  await cacheDel("permissions:all")
  await cacheDelPattern("admin:permissions:*")
  await cacheDelPattern("role:permissions:*")
}

export type AuthenticatedHandler<T = unknown> = (
  request: NextRequest,
  admin: AdminInfo
) => Promise<NextResponse<T>>

export function generateAdminToken(adminId: string): string {
  return generateToken(adminId)
}