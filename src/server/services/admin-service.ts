/**
 * 修改时间：2026-05-02 18:52:25 +08:00
 * 修改内容：新增后台管理域服务，封装管理员用户、角色、权限、个人资料的鉴权、校验、审计和缓存失效逻辑。
 * 修改模型：gpt-5.5
 */
import "server-only"

import { LogAction, PermissionType, TargetType } from "@prisma/client"
import bcrypt from "bcryptjs"
import { NextRequest } from "next/server"
import { z } from "zod"
import {
  hasPermission,
  invalidateAllPermissionsCache,
  invalidatePermissionCache,
  invalidateRoleCache,
  verifyAdminToken,
  type AdminInfo,
} from "@/lib/adminAuth"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logCreate, logDelete, logUpdate } from "@/lib/permissionLog"
import { badRequest, conflict, forbidden, notFound, unauthorized, validationError } from "@/server/contracts/errors"
import {
  countAdminUsers,
  countPermissions,
  createAdminUser,
  createPermission,
  createRole,
  deleteAdminUser,
  deletePermission,
  deleteRole,
  findAdminUserByEmail,
  findAdminUserByEmailWithRole,
  findAdminUserById,
  findAdminUserByUsername,
  findAdminUserRawById,
  findAdminUsers,
  findPermissionById,
  findPermissionByName,
  findPermissions,
  findPermissionWithRoles,
  findRoleById,
  findRoleByName,
  findRoles,
  updateAdminUser,
  updatePermission,
  updateRole,
} from "@/server/repositories/admin-repository"

export const listAdminUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  isActive: z.enum(["true", "false"]).optional(),
  keyword: z.string().optional(),
})

export const createAdminUserInputSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少 6 位"),
  roleId: z.string().min(1, "角色不能为空"),
})

export const updateAdminUserInputSchema = z.object({
  username: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  roleId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
})

export const createRoleInputSchema = z.object({
  name: z.string().min(1, "角色标识不能为空"),
  label: z.string().min(1, "角色名称不能为空"),
  description: z.string().nullable().optional(),
  permissionIds: z.array(z.string()).optional(),
})

export const updateRoleInputSchema = z.object({
  label: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  permissionIds: z.array(z.string()).optional(),
})

export const listPermissionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(50),
  type: z.nativeEnum(PermissionType).optional(),
})

export const createPermissionInputSchema = z.object({
  name: z.string().min(1, "权限标识不能为空"),
  label: z.string().min(1, "权限名称不能为空"),
  description: z.string().nullable().optional(),
  type: z.nativeEnum(PermissionType).default(PermissionType.ACTION),
})

export const updatePermissionInputSchema = z.object({
  label: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  type: z.nativeEnum(PermissionType).optional(),
})

export const updateProfileInputSchema = z.object({
  username: z.string().min(1).optional(),
  oldPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
})

export type ListAdminUsersQuery = z.infer<typeof listAdminUsersQuerySchema>
export type CreateAdminUserInput = z.infer<typeof createAdminUserInputSchema>
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserInputSchema>
export type CreateRoleInput = z.infer<typeof createRoleInputSchema>
export type UpdateRoleInput = z.infer<typeof updateRoleInputSchema>
export type ListPermissionsQuery = z.infer<typeof listPermissionsQuerySchema>
export type CreatePermissionInput = z.infer<typeof createPermissionInputSchema>
export type UpdatePermissionInput = z.infer<typeof updatePermissionInputSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>

export async function requireAdminPermission(
  request: NextRequest,
  permission: string
): Promise<AdminInfo> {
  const admin = await verifyAdminToken(request)
  if (!admin) throw unauthorized("未登录")

  const allowed = await hasPermission(admin.id, permission)
  if (!allowed) {
    try {
      await prisma.permissionLog.create({
        data: {
          action: LogAction.UPDATE,
          targetType: TargetType.PERMISSION,
          targetId: permission,
          operatorId: admin.id,
          afterData: {
            event: "ADMIN_PERMISSION_DENIED",
            permission,
            reason: "MISSING_PERMISSION",
          },
          ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
          userAgent: request.headers.get("user-agent") || null,
        },
      })
    } catch (error) {
      console.error("Failed to log permission denial:", error)
    }
    throw forbidden("没有访问权限")
  }

  return admin
}

export function parseListAdminUsersQuery(searchParams: URLSearchParams): ListAdminUsersQuery {
  const parsed = listAdminUsersQuerySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) throw validationError("用户查询参数错误", parsed.error.issues)
  return parsed.data
}

export function parseCreateAdminUserInput(input: unknown): CreateAdminUserInput {
  const parsed = createAdminUserInputSchema.safeParse(input)
  if (!parsed.success) throw validationError("创建用户参数错误", parsed.error.issues)
  return parsed.data
}

export function parseUpdateAdminUserInput(input: unknown): UpdateAdminUserInput {
  const parsed = updateAdminUserInputSchema.safeParse(input)
  if (!parsed.success) throw validationError("更新用户参数错误", parsed.error.issues)
  return parsed.data
}

export function parseCreateRoleInput(input: unknown): CreateRoleInput {
  const parsed = createRoleInputSchema.safeParse(input)
  if (!parsed.success) throw validationError("创建角色参数错误", parsed.error.issues)
  return parsed.data
}

export function parseUpdateRoleInput(input: unknown): UpdateRoleInput {
  const parsed = updateRoleInputSchema.safeParse(input)
  if (!parsed.success) throw validationError("更新角色参数错误", parsed.error.issues)
  return parsed.data
}

export function parseListPermissionsQuery(searchParams: URLSearchParams): ListPermissionsQuery {
  const parsed = listPermissionsQuerySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) throw validationError("权限查询参数错误", parsed.error.issues)
  return parsed.data
}

export function parseCreatePermissionInput(input: unknown): CreatePermissionInput {
  const parsed = createPermissionInputSchema.safeParse(input)
  if (!parsed.success) throw validationError("创建权限参数错误", parsed.error.issues)
  return parsed.data
}

export function parseUpdatePermissionInput(input: unknown): UpdatePermissionInput {
  const parsed = updatePermissionInputSchema.safeParse(input)
  if (!parsed.success) throw validationError("更新权限参数错误", parsed.error.issues)
  return parsed.data
}

export function parseUpdateProfileInput(input: unknown): UpdateProfileInput {
  const parsed = updateProfileInputSchema.safeParse(input)
  if (!parsed.success) throw validationError("更新资料参数错误", parsed.error.issues)
  return parsed.data
}

export async function listAdminUsers(query: ListAdminUsersQuery) {
  const where = buildAdminUserWhere(query)
  const skip = (query.page - 1) * query.pageSize
  const [list, total] = await Promise.all([
    findAdminUsers(prisma, { where, skip, take: query.pageSize }),
    countAdminUsers(prisma, where),
  ])

  return {
    list: list.map(sanitizeAdminUser),
    pagination: buildPagination(query.page, query.pageSize, total),
  }
}

export async function createAdminUserFromInput(
  request: NextRequest,
  operatorId: string,
  input: CreateAdminUserInput
) {
  await ensureAdminUserUnique(input)
  await ensureRoleExists(input.roleId)

  const user = await createAdminUser(prisma, {
    username: input.username,
    email: input.email,
    password: await bcrypt.hash(input.password, 10),
    roleId: input.roleId,
  })

  await logCreate(request, operatorId, TargetType.ADMIN_USER, user.id, adminUserAuditData(user))
  return sanitizeAdminUser(user)
}

export async function getAdminUserDetail(id: string) {
  const user = await findAdminUserById(prisma, id)
  if (!user) throw notFound("用户")
  return sanitizeAdminUser(user)
}

export async function updateAdminUserFromInput(
  request: NextRequest,
  operatorId: string,
  id: string,
  input: UpdateAdminUserInput
) {
  const existing = await findAdminUserRawById(prisma, id)
  if (!existing) throw notFound("用户")

  if (input.email && input.email !== existing.email) {
    const emailExists = await findAdminUserByEmail(prisma, input.email)
    if (emailExists) throw conflict("该邮箱已被使用")
  }

  if (input.username && input.username !== existing.username) {
    const usernameExists = await findAdminUserByUsername(prisma, input.username)
    if (usernameExists) throw conflict("该用户名已被使用")
  }

  if (input.roleId) await ensureRoleExists(input.roleId)

  const user = await updateAdminUser(prisma, id, {
    ...(input.username ? { username: input.username } : {}),
    ...(input.email ? { email: input.email } : {}),
    ...(input.roleId ? { role: { connect: { id: input.roleId } } } : {}),
    ...(typeof input.isActive === "boolean" ? { isActive: input.isActive } : {}),
    ...(input.password ? { password: await bcrypt.hash(input.password, 10) } : {}),
  })

  await logUpdate(
    request,
    operatorId,
    TargetType.ADMIN_USER,
    id,
    adminUserAuditData(existing),
    adminUserAuditData(user)
  )

  if (input.roleId && input.roleId !== existing.roleId) {
    await invalidatePermissionCache(id)
  }

  return sanitizeAdminUser(user)
}

export async function deleteAdminUserById(request: NextRequest, operatorId: string, id: string) {
  if (id === operatorId) throw badRequest("不能删除当前登录的用户")

  const existing = await findAdminUserRawById(prisma, id)
  if (!existing) throw notFound("用户")

  await deleteAdminUser(prisma, id)
  await logDelete(request, operatorId, TargetType.ADMIN_USER, id, adminUserAuditData(existing))
  await invalidatePermissionCache(id)

  return { deleted: true }
}

export async function listRoles() {
  const roles = await findRoles(prisma)
  return roles.map(formatRole)
}

export async function createRoleFromInput(
  request: NextRequest,
  operatorId: string,
  input: CreateRoleInput
) {
  const existing = await findRoleByName(prisma, input.name)
  if (existing) throw conflict("该角色标识已存在")

  const role = await createRole(prisma, input)
  await logCreate(request, operatorId, TargetType.ROLE, role.id, role as unknown as Record<string, unknown>)

  return formatRole(role)
}

export async function getRoleDetail(id: string) {
  const role = await findRoleById(prisma, id)
  if (!role) throw notFound("角色")
  return formatRole(role)
}

export async function updateRoleFromInput(
  request: NextRequest,
  operatorId: string,
  id: string,
  input: UpdateRoleInput
) {
  const existing = await findRoleById(prisma, id)
  if (!existing) throw notFound("角色")

  const role = await updateRole(prisma, id, {
    label: input.label ?? existing.label,
    description: input.description ?? existing.description,
    permissionIds: input.permissionIds,
  })

  await logUpdate(
    request,
    operatorId,
    TargetType.ROLE,
    id,
    existing as unknown as Record<string, unknown>,
    role as unknown as Record<string, unknown>
  )
  await invalidateRoleCache(id)

  return formatRole(role)
}

export async function deleteRoleById(request: NextRequest, operatorId: string, id: string) {
  const existing = await findRoleById(prisma, id)
  if (!existing) throw notFound("角色")
  if (existing._count.admins > 0) throw badRequest("该角色下存在管理员用户，无法删除")

  await deleteRole(prisma, id)
  await logDelete(request, operatorId, TargetType.ROLE, id, existing as unknown as Record<string, unknown>)
  await invalidateRoleCache(id)

  return { deleted: true }
}

export async function listPermissions(query: ListPermissionsQuery) {
  const where = query.type ? { type: query.type } : {}
  const skip = (query.page - 1) * query.pageSize
  const [list, total] = await Promise.all([
    findPermissions(prisma, { where, skip, take: query.pageSize }),
    countPermissions(prisma, where),
  ])

  return {
    list,
    pagination: buildPagination(query.page, query.pageSize, total),
  }
}

export async function createPermissionFromInput(
  request: NextRequest,
  operatorId: string,
  input: CreatePermissionInput
) {
  const existing = await findPermissionByName(prisma, input.name)
  if (existing) throw conflict("该权限标识已存在")

  const permission = await createPermission(prisma, {
    name: input.name,
    label: input.label,
    description: input.description ?? null,
    type: input.type,
  })

  await logCreate(request, operatorId, TargetType.PERMISSION, permission.id, permission as unknown as Record<string, unknown>)
  await invalidateAllPermissionsCache()

  return permission
}

export async function getPermissionDetail(id: string) {
  const permission = await findPermissionById(prisma, id)
  if (!permission) throw notFound("权限")
  return { ...permission, usedByRoles: permission._count.roles }
}

export async function updatePermissionFromInput(
  request: NextRequest,
  operatorId: string,
  id: string,
  input: UpdatePermissionInput
) {
  const existing = await findPermissionById(prisma, id)
  if (!existing) throw notFound("权限")

  const permission = await updatePermission(prisma, id, {
    label: input.label ?? existing.label,
    description: input.description ?? existing.description,
    type: input.type ?? existing.type,
  })

  await logUpdate(
    request,
    operatorId,
    TargetType.PERMISSION,
    id,
    existing as unknown as Record<string, unknown>,
    permission as unknown as Record<string, unknown>
  )
  await invalidateAllPermissionsCache()

  return permission
}

export async function deletePermissionById(request: NextRequest, operatorId: string, id: string) {
  const existing = await findPermissionWithRoles(prisma, id)
  if (!existing) throw notFound("权限")
  if (existing.roles.length > 0) throw badRequest("该权限已被角色使用，无法删除")

  await deletePermission(prisma, id)
  await logDelete(request, operatorId, TargetType.PERMISSION, id, existing as unknown as Record<string, unknown>)
  await invalidateAllPermissionsCache()

  return { deleted: true }
}

export async function getAdminProfile(request: NextRequest) {
  const email = await requireSessionEmail(request)
  const admin = await findAdminUserByEmailWithRole(prisma, email)
  if (!admin || !admin.isActive) throw unauthorized("账号不存在或已被禁用")

  return sanitizeAdminUser(admin)
}

export async function updateAdminProfile(request: NextRequest, input: UpdateProfileInput) {
  const email = await requireSessionEmail(request)
  const admin = await findAdminUserByEmail(prisma, email)
  if (!admin || !admin.isActive) throw unauthorized("账号不存在或已被禁用")

  const updateData: { username?: string; password?: string } = {}

  if (input.username && input.username !== admin.username) {
    const existingUser = await findAdminUserByUsername(prisma, input.username)
    if (existingUser && existingUser.id !== admin.id) throw conflict("用户名已被使用")
    updateData.username = input.username
  }

  if (input.newPassword) {
    if (!input.oldPassword) throw badRequest("请提供旧密码")

    const isOldPasswordValid = await bcrypt.compare(input.oldPassword, admin.password)
    if (!isOldPasswordValid) throw badRequest("旧密码错误")

    updateData.password = await bcrypt.hash(input.newPassword, 10)
  }

  if (Object.keys(updateData).length === 0) throw badRequest("没有需要更新的字段")

  const updatedAdmin = await updateAdminUser(prisma, admin.id, updateData)
  return sanitizeAdminUser(updatedAdmin)
}

function buildAdminUserWhere(query: ListAdminUsersQuery) {
  const where: {
    isActive?: boolean
    OR?: Array<{ username?: { contains: string; mode: "insensitive" }; email?: { contains: string; mode: "insensitive" } }>
  } = {}

  if (query.isActive !== undefined) where.isActive = query.isActive === "true"
  if (query.keyword) {
    where.OR = [
      { username: { contains: query.keyword, mode: "insensitive" } },
      { email: { contains: query.keyword, mode: "insensitive" } },
    ]
  }

  return where
}

async function ensureAdminUserUnique(input: CreateAdminUserInput) {
  const [existingEmail, existingUsername] = await Promise.all([
    findAdminUserByEmail(prisma, input.email),
    findAdminUserByUsername(prisma, input.username),
  ])

  if (existingEmail) throw conflict("该邮箱已被使用")
  if (existingUsername) throw conflict("该用户名已被使用")
}

async function ensureRoleExists(roleId: string) {
  const role = await findRoleById(prisma, roleId)
  if (!role) throw badRequest("指定的角色不存在")
}

async function requireSessionEmail(request: NextRequest): Promise<string> {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user?.email) throw unauthorized("未登录")
  return session.user.email
}

function sanitizeAdminUser(user: {
  id: string
  username: string
  email: string
  role: { id: string; name: string; label: string }
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
}) {
  // 管理员密码永远不出 service，API 只返回展示与权限判断需要的字段。
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  }
}

function adminUserAuditData(user: {
  username: string
  email: string
  roleId: string
  isActive: boolean
}) {
  return {
    username: user.username,
    email: user.email,
    roleId: user.roleId,
    isActive: user.isActive,
  }
}

function formatRole(role: {
  permissions: Array<{ id: string; name: string; label: string }>
  _count?: { admins: number }
}) {
  return {
    ...role,
    permissions: role.permissions.map((permission) => ({
      id: permission.id,
      name: permission.name,
      label: permission.label,
    })),
    adminCount: role._count?.admins ?? 0,
  }
}

function buildPagination(page: number, pageSize: number, total: number) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  }
}
