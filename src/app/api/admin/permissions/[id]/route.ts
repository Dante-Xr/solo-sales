/**
 * ============================================
 * 管理员权限详情 API 路由
 * ============================================
 * 功能说明：
 *   - 更新权限
 *   - 删除权限
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient, PermissionType } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * PATCH /api/admin/permissions/[id] - 更新权限
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { label, description, type } = body

    const existing = await prisma.permission.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "权限不存在" },
        { status: 404 }
      )
    }

    const permission = await prisma.permission.update({
      where: { id },
      data: {
        label: label ?? existing.label,
        description: description ?? existing.description,
        type: type ?? existing.type,
      },
    })

    return NextResponse.json({ success: true, data: permission })
  } catch (error) {
    console.error("更新权限失败:", error)
    return NextResponse.json(
      { success: false, error: "更新权限失败" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/permissions/[id] - 删除权限
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.permission.findUnique({
      where: { id },
      include: {
        roles: true,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "权限不存在" },
        { status: 404 }
      )
    }

    if (existing.roles.length > 0) {
      return NextResponse.json(
        { success: false, error: "该权限已被角色使用，无法删除" },
        { status: 400 }
      )
    }

    await prisma.permission.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: "删除成功" })
  } catch (error) {
    console.error("删除权限失败:", error)
    return NextResponse.json(
      { success: false, error: "删除权限失败" },
      { status: 500 }
    )
  }
}
