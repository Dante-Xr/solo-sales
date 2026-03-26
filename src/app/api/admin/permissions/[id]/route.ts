/**
 * ============================================
 * 管理员权限详情 API 路由
 * ============================================
 * 功能说明：
 *   - 获取权限详情
 *   - 更新权限
 *   - 删除权限
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { verifyAdminToken, hasPermission, invalidateAllPermissionsCache } from "@/lib/adminAuth"
import { logUpdate, logDelete } from "@/lib/permissionLog"
import { TargetType } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * GET /api/admin/permissions/[id] - 获取权限详情
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

    const hasAccess = await hasPermission(admin.id, "permissions.view")
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "没有访问权限" }, { status: 403 })
    }

    const { id } = await params
    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        _count: {
          select: { roles: true },
        },
      },
    })

    if (!permission) {
      return NextResponse.json({ success: false, error: "权限不存在" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...permission,
        usedByRoles: permission._count.roles,
      },
    })
  } catch (error) {
    console.error("获取权限详情失败:", error)
    return NextResponse.json({ success: false, error: "获取权限详情失败" }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/permissions/[id] - 更新权限
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

    const hasAccess = await hasPermission(admin.id, "permissions.update")
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "没有访问权限" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { label, description, type } = body

    const existing = await prisma.permission.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ success: false, error: "权限不存在" }, { status: 404 })
    }

    const permission = await prisma.permission.update({
      where: { id },
      data: {
        label: label ?? existing.label,
        description: description ?? existing.description,
        type: type ?? existing.type,
      },
    })

    await logUpdate(request, admin.id, TargetType.PERMISSION, id, existing as Record<string, unknown>, permission as Record<string, unknown>)

    await invalidateAllPermissionsCache()

    return NextResponse.json({ success: true, data: permission })
  } catch (error) {
    console.error("更新权限失败:", error)
    return NextResponse.json({ success: false, error: "更新权限失败" }, { status: 500 })
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
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const hasAccess = await hasPermission(admin.id, "permissions.delete")
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "没有访问权限" }, { status: 403 })
    }

    const { id } = await params

    const existing = await prisma.permission.findUnique({
      where: { id },
      include: { roles: true },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: "权限不存在" }, { status: 404 })
    }

    if (existing.roles.length > 0) {
      return NextResponse.json(
        { success: false, error: "该权限已被角色使用，无法删除" },
        { status: 400 }
      )
    }

    await prisma.permission.delete({ where: { id } })

    await logDelete(request, admin.id, TargetType.PERMISSION, id, existing as Record<string, unknown>)

    await invalidateAllPermissionsCache()

    return NextResponse.json({ success: true, message: "删除成功" })
  } catch (error) {
    console.error("删除权限失败:", error)
    return NextResponse.json({ success: false, error: "删除权限失败" }, { status: 500 })
  }
}