/**
 * ============================================
 * 管理员权限管理 API 路由
 * ============================================
 * 功能说明：
 *   - 获取权限列表
 *   - 创建权限
 *   - 更新权限
 *   - 删除权限
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient, PermissionType } from "@prisma/client"
import { verifyAdminToken, hasPermission, invalidateAllPermissionsCache } from "@/lib/adminAuth"
import { logCreate } from "@/lib/permissionLog"
import { TargetType } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * GET /api/admin/permissions - 获取权限列表
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const hasAccess = await hasPermission(admin.id, "permissions.view")
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "没有访问权限" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "50")
    const type = searchParams.get("type") as PermissionType | null

    const where: Record<string, unknown> = {}
    if (type) {
      where.type = type
    }

    const [list, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        orderBy: [{ type: "asc" }, { name: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.permission.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        list,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    })
  } catch (error) {
    console.error("获取权限列表失败:", error)
    return NextResponse.json({ success: false, error: "获取权限列表失败" }, { status: 500 })
  }
}

/**
 * POST /api/admin/permissions - 创建权限
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const hasAccess = await hasPermission(admin.id, "permissions.create")
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "没有访问权限" }, { status: 403 })
    }

    const body = await request.json()
    const { name, label, description, type } = body

    if (!name || !label) {
      return NextResponse.json({ success: false, error: "权限标识和名称不能为空" }, { status: 400 })
    }

    const existing = await prisma.permission.findUnique({ where: { name } })

    if (existing) {
      return NextResponse.json({ success: false, error: "该权限标识已存在" }, { status: 409 })
    }

    const permission = await prisma.permission.create({
      data: {
        name,
        label,
        description: description || null,
        type: type || PermissionType.ACTION,
      },
    })

    await logCreate(request, admin.id, TargetType.PERMISSION, permission.id, permission as unknown as Record<string, unknown>)

    await invalidateAllPermissionsCache()

    return NextResponse.json({ success: true, data: permission }, { status: 201 })
  } catch (error) {
    console.error("创建权限失败:", error)
    return NextResponse.json({ success: false, error: "创建权限失败" }, { status: 500 })
  }
}