/**
 * ============================================
 * 管理员用户详情 API 路由
 * ============================================
 * 功能说明：
 *   - 更新用户
 *   - 删除用户
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

/**
 * PATCH /api/admin/users/[id] - 更新用户
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { username, email, password, roleId, isActive } = body

    const existing = await prisma.adminUser.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "用户不存在" },
        { status: 404 }
      )
    }

    if (email && email !== existing.email) {
      const emailExists = await prisma.adminUser.findUnique({
        where: { email },
      })
      if (emailExists) {
        return NextResponse.json(
          { success: false, error: "该邮箱已被使用" },
          { status: 409 }
        )
      }
    }

    if (username && username !== existing.username) {
      const usernameExists = await prisma.adminUser.findUnique({
        where: { username },
      })
      if (usernameExists) {
        return NextResponse.json(
          { success: false, error: "该用户名已被使用" },
          { status: 409 }
        )
      }
    }

    if (roleId) {
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      })
      if (!role) {
        return NextResponse.json(
          { success: false, error: "指定的角色不存在" },
          { status: 400 }
        )
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
    return NextResponse.json(
      { success: false, error: "更新用户失败" },
      { status: 500 }
    )
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
    const { id } = await params

    const existing = await prisma.adminUser.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "用户不存在" },
        { status: 404 }
      )
    }

    await prisma.adminUser.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: "删除成功" })
  } catch (error) {
    console.error("删除用户失败:", error)
    return NextResponse.json(
      { success: false, error: "删除用户失败" },
      { status: 500 }
    )
  }
}
