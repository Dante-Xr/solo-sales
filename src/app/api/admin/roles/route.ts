/**
 * ============================================
 * 管理员角色管理 API 路由
 * ============================================
 * 功能说明：
 *   - 获取角色列表
 *   - 创建角色
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { verifyAdminToken, hasPermission, invalidateRoleCache } from "@/lib/adminAuth"
import { logCreate } from "@/lib/permissionLog"
import { TargetType } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * GET /api/admin/roles - 获取角色列表
 */
export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
        _count: {
          select: { admins: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: roles.map((role) => ({
        ...role,
        permissions: role.permissions.map((p) => ({
          id: p.id,
          name: p.name,
          label: p.label,
        })),
        adminCount: role._count.admins,
      })),
    })
  } catch (error) {
    console.error("获取角色列表失败:", error)
    return NextResponse.json({ success: false, error: "获取角色列表失败" }, { status: 500 })
  }
}

/**
 * POST /api/admin/roles - 创建角色
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const hasAccess = await hasPermission(admin.id, "roles.create")
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "没有访问权限" }, { status: 403 })
    }

    const body = await request.json()
    const { name, label, description, permissionIds } = body

    if (!name || !label) {
      return NextResponse.json({ success: false, error: "角色标识和名称不能为空" }, { status: 400 })
    }

    const existing = await prisma.role.findUnique({ where: { name } })

    if (existing) {
      return NextResponse.json({ success: false, error: "该角色标识已存在" }, { status: 409 })
    }

    const role = await prisma.role.create({
      data: {
        name,
        label,
        description: description || null,
        permissions: permissionIds?.length
          ? { connect: permissionIds.map((id: string) => ({ id })) }
          : undefined,
      },
      include: {
        permissions: true,
      },
    })

    await logCreate(request, admin.id, TargetType.ROLE, role.id, role as unknown as Record<string, unknown>)

    if (permissionIds?.length) {
      await Promise.all(permissionIds.map((pid: string) => invalidateRoleCache(pid)))
    }

    return NextResponse.json({
      success: true,
      data: {
        ...role,
        permissions: role.permissions.map((p) => ({
          id: p.id,
          name: p.name,
          label: p.label,
        })),
      }
    }, { status: 201 })
  } catch (error) {
    console.error("创建角色失败:", error)
    return NextResponse.json({ success: false, error: "创建角色失败" }, { status: 500 })
  }
}