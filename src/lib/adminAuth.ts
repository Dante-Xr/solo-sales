/**
 * 修改时间：2026-05-02 21:19:13 +08:00
 * 修改内容：清理管理员认证工具中未使用的 next/headers 导入，推进 M5 lint warnings 收敛。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 管理员认证与权限验证库 (Phase 2 安全修复)
 * ============================================
 * 功能说明：
 *   - 验证管理员身份（使用 Better Auth Session）
 *   - 提供权限检查功能
 *   - 管理权限缓存
 *
 * 安全改进：
 *   - 之前使用 Base64 伪造 Token，可被轻易篡改
 *   - 现在使用 Better Auth 的 HMAC 签名 Session Cookie
 *   - 会话存储在数据库中，支持即时撤销
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "./prisma"
import { cacheGet, cacheSet, cacheDel, cacheDelPattern, CACHE_KEYS } from "./cache"
import { auth } from "./auth"

/** 权限缓存 TTL（秒） */
const CACHE_TTL = {
  ADMIN_PERMISSIONS: 300,
  ROLE_PERMISSIONS: 600,
  ALL_PERMISSIONS: 1800,
} as const

/**
 * 管理员信息接口
 * 包含管理员的基本信息和关联的角色权限
 */
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

/**
 * 验证管理员身份
 *
 * 验证流程：
 *   1. 从请求头中获取 Better Auth Session
 *   2. 通过 Session 中的邮箱查找管理员记录
 *   3. 检查管理员是否处于激活状态
 *   4. 返回管理员信息及其角色权限
 *
 * @param request - Next.js 请求对象
 * @returns 管理员信息，如果验证失败则返回 null
 */
export async function verifyAdminToken(request: NextRequest): Promise<AdminInfo | null> {
  try {
    // 使用 Better Auth 获取会话（自动验证 Cookie 签名）
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    // 会话不存在或用户未登录
    if (!session?.user) {
      return null
    }

    // 根据会话中的邮箱查询管理员记录
    const admin = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
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

    // 管理员不存在或已被禁用
    if (!admin || !admin.isActive) {
      return null
    }

    // 返回管理员信息和关联的角色权限
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

/**
 * 获取管理员权限列表
 * 使用 Redis 缓存减少数据库查询
 *
 * @param adminId - 管理员 ID
 * @returns 权限名称数组
 */
export async function getAdminPermissions(adminId: string): Promise<string[]> {
  const cacheKey = CACHE_KEYS.ADMIN_PERMISSIONS(adminId)

  // 尝试从缓存获取
  const cached = await cacheGet<string[]>(cacheKey)
  if (cached) {
    return cached
  }

  // 缓存未命中，从数据库查询
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

  // 提取权限名称数组
  const permissions = admin.role.permissions.map((p) => p.name)

  // 写入缓存，5 分钟后过期
  await cacheSet(cacheKey, permissions, CACHE_TTL.ADMIN_PERMISSIONS)

  return permissions
}

/**
 * 检查管理员是否拥有指定权限
 *
 * @param adminId - 管理员 ID（"system" 表示系统管理员，拥有所有权限）
 * @param permission - 权限名称
 * @returns 是否拥有该权限
 */
export async function hasPermission(adminId: string, permission: string): Promise<boolean> {
  // 系统管理员拥有所有权限
  if (adminId === "system") {
    return true
  }

  const permissions = await getAdminPermissions(adminId)

  // * 表示拥有所有权限
  if (permissions.includes("*")) {
    return true
  }

  return permissions.includes(permission)
}

/**
 * 检查管理员是否拥有指定权限中的任意一个
 *
 * @param adminId - 管理员 ID
 * @param permissions - 权限名称数组
 * @returns 是否拥有任意一个权限
 */
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

/**
 * 检查管理员是否拥有所有指定权限
 *
 * @param adminId - 管理员 ID
 * @param permissions - 权限名称数组
 * @returns 是否拥有所有权限
 */
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

/**
 * 使指定管理员的权限缓存失效
 * 当管理员角色或权限变更时调用
 */
export async function invalidatePermissionCache(adminId: string): Promise<void> {
  const cacheKey = CACHE_KEYS.ADMIN_PERMISSIONS(adminId)
  await cacheDel(cacheKey)
}

/**
 * 使指定角色的所有管理员权限缓存失效
 * 当角色权限变更时调用
 */
export async function invalidateRoleCache(roleId: string): Promise<void> {
  const cacheKey = CACHE_KEYS.ROLE_PERMISSIONS(roleId)
  await cacheDel(cacheKey)

  // 查找该角色下的所有管理员
  const admins = await prisma.adminUser.findMany({
    where: { roleId },
    select: { id: true },
  })

  // 批量清除这些管理员的权限缓存
  await Promise.all(admins.map((admin) => invalidatePermissionCache(admin.id)))
}

/**
 * 清除所有权限相关缓存
 * 用于权限系统全面刷新
 */
export async function invalidateAllPermissionsCache(): Promise<void> {
  await cacheDel(CACHE_KEYS.ALL_PERMISSIONS)
  await cacheDelPattern("solo:admin:permissions:*")
  await cacheDelPattern("solo:admin:role:*")
}

/**
 * 已认证管理员处理器类型
 * 用于包装需要验证管理员身份的 API 路由
 */
export type AuthenticatedHandler<T = unknown> = (
  request: NextRequest,
  admin: AdminInfo
) => Promise<NextResponse<T>>
