/**
 * ============================================
 * 管理员用户管理 API 路由
 * ============================================
 * 功能说明：
 *   - 获取用户列表
 *   - 创建用户
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

/**
 * GET /api/admin/users - 获取用户列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const isActive = searchParams.get("isActive")
    const keyword = searchParams.get("keyword")

    const where: Record<string, unknown> = {}

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true"
    }

    if (keyword) {
      where.OR = [
        { username: { contains: keyword, mode: "insensitive" } },
        { email: { contains: keyword, mode: "insensitive" } },
      ]
    }

    const [list, total] = await Promise.all([
      prisma.adminUser.findMany({
        where,
        include: {
          role: {
            select: {
              id: true,
              name: true,
              label: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.adminUser.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        list: list.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    })
  } catch (error) {
    console.error("获取用户列表失败:", error)
    return NextResponse.json(
      { success: false, error: "获取用户列表失败" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/users - 创建用户
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password, roleId } = body

    if (!username || !email || !password || !roleId) {
      return NextResponse.json(
        { success: false, error: "用户名、邮箱、密码和角色不能为空" },
        { status: 400 }
      )
    }

    const existingEmail = await prisma.adminUser.findUnique({
      where: { email },
    })

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: "该邮箱已被使用" },
        { status: 409 }
      )
    }

    const existingUsername = await prisma.adminUser.findUnique({
      where: { username },
    })

    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: "该用户名已被使用" },
        { status: 409 }
      )
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
    })

    if (!role) {
      return NextResponse.json(
        { success: false, error: "指定的角色不存在" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.adminUser.create({
      data: {
        username,
        email,
        password: hashedPassword,
        roleId,
      },
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

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("创建用户失败:", error)
    return NextResponse.json(
      { success: false, error: "创建用户失败" },
      { status: 500 }
    )
  }
}
