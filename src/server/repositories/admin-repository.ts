/**
 * 修改时间：2026-05-02 18:52:25 +08:00
 * 修改内容：新增后台管理域仓储封装，集中管理员、角色、权限和权限日志相关 Prisma 操作。
 * 修改模型：gpt-5.5
 */
import "server-only"

import type { Prisma, PrismaClient } from "@prisma/client"

export type AdminDbClient = PrismaClient | Prisma.TransactionClient

export const adminRoleSelect = {
  id: true,
  name: true,
  label: true,
} satisfies Prisma.RoleSelect

export function findAdminUsers(
  db: AdminDbClient,
  args: { where: Prisma.AdminUserWhereInput; skip: number; take: number }
) {
  return db.adminUser.findMany({
    where: args.where,
    include: { role: { select: adminRoleSelect } },
    orderBy: { createdAt: "desc" },
    skip: args.skip,
    take: args.take,
  })
}

export function countAdminUsers(db: AdminDbClient, where: Prisma.AdminUserWhereInput) {
  return db.adminUser.count({ where })
}

export function findAdminUserById(db: AdminDbClient, id: string) {
  return db.adminUser.findUnique({
    where: { id },
    include: { role: { select: adminRoleSelect } },
  })
}

export function findAdminUserRawById(db: AdminDbClient, id: string) {
  return db.adminUser.findUnique({ where: { id } })
}

export function findAdminUserByEmail(db: AdminDbClient, email: string) {
  return db.adminUser.findUnique({ where: { email } })
}

export function findAdminUserByUsername(db: AdminDbClient, username: string) {
  return db.adminUser.findUnique({ where: { username } })
}

export function findAdminUserByEmailWithRole(db: AdminDbClient, email: string) {
  return db.adminUser.findUnique({
    where: { email },
    include: { role: { select: adminRoleSelect } },
  })
}

export function createAdminUser(
  db: AdminDbClient,
  data: { username: string; email: string; password: string; roleId: string }
) {
  return db.adminUser.create({
    data,
    include: { role: { select: adminRoleSelect } },
  })
}

export function updateAdminUser(
  db: AdminDbClient,
  id: string,
  data: Prisma.AdminUserUpdateInput
) {
  return db.adminUser.update({
    where: { id },
    data,
    include: { role: { select: adminRoleSelect } },
  })
}

export function deleteAdminUser(db: AdminDbClient, id: string) {
  return db.adminUser.delete({ where: { id } })
}

export function findRoles(db: AdminDbClient) {
  return db.role.findMany({
    include: {
      permissions: true,
      _count: { select: { admins: true } },
    },
    orderBy: { createdAt: "asc" },
  })
}

export function findRoleById(db: AdminDbClient, id: string) {
  return db.role.findUnique({
    where: { id },
    include: {
      permissions: true,
      _count: { select: { admins: true } },
    },
  })
}

export function findRoleByName(db: AdminDbClient, name: string) {
  return db.role.findUnique({ where: { name } })
}

export function createRole(
  db: AdminDbClient,
  data: { name: string; label: string; description?: string | null; permissionIds?: string[] }
) {
  return db.role.create({
    data: {
      name: data.name,
      label: data.label,
      description: data.description ?? null,
      permissions: data.permissionIds?.length
        ? { connect: data.permissionIds.map((id) => ({ id })) }
        : undefined,
    },
    include: { permissions: true },
  })
}

export function updateRole(
  db: AdminDbClient,
  id: string,
  data: { label?: string; description?: string | null; permissionIds?: string[] }
) {
  return db.role.update({
    where: { id },
    data: {
      label: data.label,
      description: data.description,
      permissions: data.permissionIds
        ? { set: data.permissionIds.map((permissionId) => ({ id: permissionId })) }
        : undefined,
    },
    include: { permissions: true },
  })
}

export function deleteRole(db: AdminDbClient, id: string) {
  return db.role.delete({ where: { id } })
}

export function findPermissions(
  db: AdminDbClient,
  args: { where: Prisma.PermissionWhereInput; skip: number; take: number }
) {
  return db.permission.findMany({
    where: args.where,
    orderBy: [{ type: "asc" }, { name: "asc" }],
    skip: args.skip,
    take: args.take,
  })
}

export function countPermissions(db: AdminDbClient, where: Prisma.PermissionWhereInput) {
  return db.permission.count({ where })
}

export function findPermissionById(db: AdminDbClient, id: string) {
  return db.permission.findUnique({
    where: { id },
    include: { _count: { select: { roles: true } } },
  })
}

export function findPermissionWithRoles(db: AdminDbClient, id: string) {
  return db.permission.findUnique({
    where: { id },
    include: { roles: true },
  })
}

export function findPermissionByName(db: AdminDbClient, name: string) {
  return db.permission.findUnique({ where: { name } })
}

export function createPermission(db: AdminDbClient, data: Prisma.PermissionCreateInput) {
  return db.permission.create({ data })
}

export function updatePermission(
  db: AdminDbClient,
  id: string,
  data: Prisma.PermissionUpdateInput
) {
  return db.permission.update({ where: { id }, data })
}

export function deletePermission(db: AdminDbClient, id: string) {
  return db.permission.delete({ where: { id } })
}
