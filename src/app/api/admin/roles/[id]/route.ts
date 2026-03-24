/**
 * ============================================
 * 管理员角色详情 API 路由
 * ============================================
 * 功能说明：
 *   - 获取角色详情
 *   - 更新角色
 *   - 删除角色
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { verifyAdminToken, hasPermission, invalidateRoleCache } from "@/lib/adminAuth"
import { logUpdate, logDelete } from "@/lib/permissionLog"
import { TargetType } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * GET /api/admin/roles/[id] - 获取角色详情
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

    const hasAccess = await hasPermission(admin.id, "roles.view")
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "没有访问权限" }, { status: 403 })
    }

    const { id } = await params
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        _count: {
          select: { admins: true },
        },
      },
    })

    if (!role) {
      return NextResponse.json({ success: false, error: "角色不存在" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...role,
        adminCount: role._count.admins,
      },
    })
  } catch (error) {
    console.error("获取角色详情失败:", error)
    return NextResponse.json({ success: false, error: "获取角色详情失败" }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/roles/[id] - 更新角色
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

    const hasAccess = await hasPermission(admin.id, "roles.update")
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "没有访问权限" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { label, description, permissionIds } = body

    const existing = await prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: "角色不存在" }, { status: 404 })
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

    await logUpdate(
      request,
      admin.id,
      TargetType.ROLE,
      id,
      existing as unknown as Record<string, unknown>,
      role as unknown as Record<string, unknown>
    )

    await invalidateRoleCache(id)

    return NextResponse.json({
      success: true,
      data: {
        ...role,
        permissions: role.permissions.map((p) => ({
          id: p.id,
          name: p.name,
          label: p.label,
        })),
      },
    })
  } catch (error) {
    console.error("更新角色失败:", error)
    return NextResponse.json({ success: false, error: "更新角色失败" }, { status: 500 })
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
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const hasAccess = await hasPermission(admin.id, "roles.delete")
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "没有访问权限" }, { status: 403 })
    }

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
      return NextResponse.json({ success: false, error: "角色不存在" }, { status: 404 })
    }

    if (existing._count.admins > 0) {
      return NextResponse.json(
        { success: false, error: "该角色下存在管理员用户，无法删除" },
        { status: 400 }
      )
    }

    await prisma.role.delete({ where: { id } })

    await logDelete(request, admin.id, TargetType.ROLE, id, existing as Record<string, unknown>)

    await invalidateRoleCache(id)

    return NextResponse.json({ success: true, message: "删除成功" })
  } catch (error) {
    console.error("删除角色失败:", error)
    return NextResponse.json({ success: false, error: "删除角色失败" }, { status: 500 })
  }
}