/**
 * 修改时间：2026-05-02 18:52:25 +08:00
 * 修改内容：新增后台管理域服务测试，覆盖管理员唯一性、角色删除保护、权限分页和个人资料密码校验。
 * 修改模型：gpt-5.5
 */
import { PermissionType } from "@prisma/client"
import {
  createAdminUserFromInput,
  deleteRoleById,
  listPermissions,
  requireAdminPermission,
  updateAdminProfile,
} from "../admin-service"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    adminUser: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    permission: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    permissionLog: {
      create: jest.fn(),
    },
    role: {
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}))

jest.mock("@/lib/auth", () => ({
  auth: {
    api: {
      changePassword: jest.fn(),
      getSession: jest.fn(),
    },
  },
}))

jest.mock("@/lib/adminAuth", () => ({
  hasPermission: jest.fn(),
  invalidateAllPermissionsCache: jest.fn(),
  invalidatePermissionCache: jest.fn(),
  invalidateRoleCache: jest.fn(),
  verifyAdminToken: jest.fn(),
}))

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}))

const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: {
    adminUser: {
      create: jest.Mock
      findUnique: jest.Mock
      update: jest.Mock
    }
    permission: {
      count: jest.Mock
      findMany: jest.Mock
    }
    permissionLog: {
      create: jest.Mock
    }
    role: {
      delete: jest.Mock
      findUnique: jest.Mock
    }
  }
}

const { auth } = jest.requireMock("@/lib/auth") as {
  auth: { api: { changePassword: jest.Mock; getSession: jest.Mock } }
}

const { hasPermission, verifyAdminToken } = jest.requireMock("@/lib/adminAuth") as {
  hasPermission: jest.Mock
  verifyAdminToken: jest.Mock
}

const bcrypt = jest.requireMock("bcryptjs") as {
  compare: jest.Mock
  hash: jest.Mock
}

const mockRequest = {
  headers: {
    get: jest.fn(() => null),
  },
} as never

describe("admin-service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("rejects admin user creation when email already exists", async () => {
    prisma.adminUser.findUnique
      .mockResolvedValueOnce({ id: "existing_email" })
      .mockResolvedValueOnce(null)

    await expect(
      createAdminUserFromInput(mockRequest, "operator_1", {
        username: "new-admin",
        email: "admin@example.com",
        password: "secret123",
        roleId: "role_1",
      })
    ).rejects.toMatchObject({
      message: "该邮箱已被使用",
      statusCode: 409,
    })

    expect(prisma.adminUser.create).not.toHaveBeenCalled()
  })

  it("creates admin user with hashed password and audit log", async () => {
    prisma.adminUser.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
    prisma.role.findUnique.mockResolvedValueOnce({
      id: "role_1",
      permissions: [],
      _count: { admins: 0 },
    })
    bcrypt.hash.mockResolvedValue("hashed-password")
    prisma.adminUser.create.mockResolvedValue({
      id: "admin_1",
      username: "new-admin",
      email: "admin@example.com",
      roleId: "role_1",
      role: { id: "role_1", name: "admin", label: "管理员" },
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date("2026-05-02T00:00:00.000Z"),
    })
    prisma.permissionLog.create.mockResolvedValue({})

    const result = await createAdminUserFromInput(mockRequest, "operator_1", {
      username: "new-admin",
      email: "admin@example.com",
      password: "secret123",
      roleId: "role_1",
    })

    expect(bcrypt.hash).toHaveBeenCalledWith("secret123", 10)
    expect(prisma.adminUser.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ password: "hashed-password" }),
      })
    )
    expect(prisma.permissionLog.create).toHaveBeenCalled()
    expect(result).not.toHaveProperty("password")
  })

  it("prevents deleting a role that still has admins", async () => {
    prisma.role.findUnique.mockResolvedValue({
      id: "role_1",
      permissions: [],
      _count: { admins: 2 },
    })

    await expect(deleteRoleById(mockRequest, "operator_1", "role_1")).rejects.toMatchObject({
      message: "该角色下存在管理员用户，无法删除",
      statusCode: 400,
    })
    expect(prisma.role.delete).not.toHaveBeenCalled()
  })

  it("lists permissions with type filter and pagination", async () => {
    prisma.permission.findMany.mockResolvedValue([{ id: "perm_1", type: PermissionType.ACTION }])
    prisma.permission.count.mockResolvedValue(51)

    const result = await listPermissions({
      page: 2,
      pageSize: 50,
      type: PermissionType.ACTION,
    })

    expect(prisma.permission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { type: PermissionType.ACTION },
        skip: 50,
        take: 50,
      })
    )
    expect(result.pagination.totalPages).toBe(2)
  })

  it("records a denial audit log when an admin lacks a required permission", async () => {
    verifyAdminToken.mockResolvedValue({ id: "admin_1", email: "admin@example.com" })
    hasPermission.mockResolvedValue(false)
    prisma.permissionLog.create.mockResolvedValue({})

    await expect(requireAdminPermission(mockRequest, "orders.update")).rejects.toMatchObject({
      message: "没有访问权限",
      statusCode: 403,
    })

    expect(prisma.permissionLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        operatorId: "admin_1",
        targetType: "PERMISSION",
        targetId: "orders.update",
        afterData: expect.objectContaining({
          event: "ADMIN_PERMISSION_DENIED",
          permission: "orders.update",
          reason: "MISSING_PERMISSION",
        }),
      }),
    })
  })

  it("rejects profile password update when old password is wrong", async () => {
    auth.api.getSession.mockResolvedValue({ user: { id: "session_1", email: "admin@example.com" } })
    prisma.adminUser.findUnique.mockResolvedValue({
      id: "admin_1",
      username: "admin",
      email: "admin@example.com",
      userId: "user_1",
      isActive: true,
    })
    auth.api.changePassword.mockRejectedValue(new Error("invalid password"))

    await expect(
      updateAdminProfile(mockRequest, {
        oldPassword: "wrong-password",
        newPassword: "new-password",
      })
    ).rejects.toMatchObject({
      message: "旧密码错误",
      statusCode: 400,
    })

    expect(prisma.adminUser.update).not.toHaveBeenCalled()
  })
})
