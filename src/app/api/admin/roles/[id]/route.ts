/**
 * ============================================
 * 管理员角色详情 API 路由
 * ============================================
 * 功能说明：
 *   - 更新角色
 *   - 删除角色
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * PATCH /api/admin/roles/[id] - 更新角色
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { label, description, permissionIds } = body

    const existing = await prisma.role.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "角色不存在" },
        { status: 404 }
      )
    }

    const role = await prisma.role.update({
      where: { id },
      data: {
        label: label ?? existing.label,
        description: description ?? existing.description,
        permissions: permissionIds
          ? {
              set: permissionIds.map((pid: string) => ({ id: pid })),
            }
          : undefined,
      },
      include: {
        permissions: true,
      },
    })

    return NextResponse.json({ success: true, data: role })
  } catch (error) {
    console.error("更新角色失败:", error)
    return NextResponse.json(
      { success: false, error: "更新角色失败" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/roles/[id] - 删除角色
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { admins: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "角色不存在" },
        { status: 404 }
      )
    }

    if (existing._count.admins > 0) {
      return NextResponse.json(
        { success: false, error: "该角色下存在管理员用户，无法删除" },
        { status: 400 }
      )
    }

    await prisma.role.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: "删除成功" })
  } catch (error) {
    console.error("删除角色失败:", error)
    return NextResponse.json(
      { success: false, error: "删除角色失败" },
      { status: 500 }
    )
  }
}
