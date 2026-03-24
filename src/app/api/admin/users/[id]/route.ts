/**
 * ============================================
 * 管理员用户详情 API 路由
 * ============================================
 * 功能说明：
 *   - 获取用户详情
 *   - 更新用户
 *   - 删除用户
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { verifyAdminToken, hasPermission, invalidatePermissionCache } from "@/lib/adminAuth"
import { logUpdate, logDelete } from "@/lib/permissionLog"
import { TargetType } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * GET /api/admin/users/[id] - 获取用户详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const hasAccess = await hasPermission(admin.id, "users.view")
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "没有访问权限" }, { status: 403 })
    }

    const { id } = await params
    const user = await prisma.adminUser.findUnique({
      where: { id },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            label: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "用户不存在" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("获取用户详情失败:", error)
    return NextResponse.json({ success: false, error: "获取用户详情失败" }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/users/[id] - 更新用户
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const hasAccess = await hasPermission(admin.id, "users.update")
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "没有访问权限" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { username, email, password, roleId, isActive } = body

    const existing = await prisma.adminUser.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ success: false, error: "用户不存在" }, { status: 404 })
    }

    if (email && email !== existing.email) {
      const emailExists = await prisma.adminUser.findUnique({ where: { email } })
      if (emailExists) {
        return NextResponse.json({ success: false, error: "该邮箱已被使用" }, { status: 409 })
      }
    }

    if (username && username !== existing.username) {
      const usernameExists = await prisma.adminUser.findUnique({ where: { username } })
      if (usernameExists) {
        return NextResponse.json({ success: false, error: "该用户名已被使用" }, { status: 409 })
      }
    }

    if (roleId) {
      const role = await prisma.role.findUnique({ where: { id: roleId } })
      if (!role) {
        return NextResponse.json({ success: false, error: "指定的角色不存在" }, { status: 400 })
      }
    }

    const updateData: Record<string, unknown> = {}

    if (username) updateData.username = username
    if (email) updateData.email = email
    if (roleId) updateData.roleId = roleId
    if (typeof isActive === "boolean") updateData.isActive = isActive
    if (password) updateData.password = await bcrypt.hash(password, 10)

    const user = await prisma.adminUser.update({
      where: { id },
      data: updateData,
      include: {
        role: {
          select: {
            id: true,
            name: true,
            label: true,
          },
        },
      },
    })

    await logUpdate(
      request,
      admin.id,
      TargetType.ADMIN_USER,
      id,
      {
        username: existing.username,
        email: existing.email,
        roleId: existing.roleId,
        isActive: existing.isActive,
      },
      {
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        isActive: user.isActive,
      }
    )

    if (roleId && roleId !== existing.roleId) {
      await invalidatePermissionCache(id)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("更新用户失败:", error)
    return NextResponse.json({ success: false, error: "更新用户失败" }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/users/[id] - 删除用户
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const hasAccess = await hasPermission(admin.id, "users.delete")
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "没有访问权限" }, { status: 403 })
    }

    const { id } = await params

    if (id === admin.id) {
      return NextResponse.json({ success: false, error: "不能删除当前登录的用户" }, { status: 400 })
    }

    const existing = await prisma.adminUser.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ success: false, error: "用户不存在" }, { status: 404 })
    }

    await prisma.adminUser.delete({ where: { id } })

    await logDelete(
      request,
      admin.id,
      TargetType.ADMIN_USER,
      id,
      {
        username: existing.username,
        email: existing.email,
        roleId: existing.roleId,
        isActive: existing.isActive,
      }
    )

    await invalidatePermissionCache(id)

    return NextResponse.json({ success: true, message: "删除成功" })
  } catch (error) {
    console.error("删除用户失败:", error)
    return NextResponse.json({ success: false, error: "删除用户失败" }, { status: 500 })
  }
}