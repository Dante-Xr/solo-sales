/**
 * ============================================
 * 管理员认证 API 路由
 * ============================================
 * 功能说明：
 *   - 管理员登录
 *   - 管理员登出
 *   - 获取当前管理员信息
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const ADMIN_COOKIE_NAME = "admin_token"
const ADMIN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days

function generateToken(adminId: string): string {
  const payload = {
    adminId,
    timestamp: Date.now(),
    random: Math.random().toString(36).substring(2),
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

function parseToken(token: string): { adminId: string } | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const payload = JSON.parse(decoded)
    return { adminId: payload.adminId }
  } catch {
    return null
  }
}

/**
 * POST /api/admin/auth/login - 管理员登录
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, remember } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "邮箱和密码不能为空" },
        { status: 400 }
      )
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "邮箱或密码错误" },
        { status: 401 }
      )
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, error: "账号已被禁用" },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "邮箱或密码错误" },
        { status: 401 }
      )
    }

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    })

    const token = generateToken(admin.id)

    const response = NextResponse.json({
      success: true,
      data: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: {
          id: admin.role.id,
          name: admin.role.name,
          label: admin.role.label,
        },
      },
    })

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: remember ? ADMIN_COOKIE_MAX_AGE : undefined,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("管理员登录失败:", error)
    return NextResponse.json(
      { success: false, error: "登录失败，请稍后重试" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/auth/logout - 管理员登出
 */
export async function PUT(_request: NextRequest) {
  const response = NextResponse.json({ success: true, message: "登出成功" })
  response.cookies.delete(ADMIN_COOKIE_NAME)
  return response
}

/**
 * GET /api/admin/auth/me - 获取当前管理员信息
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      )
    }

    const tokenData = parseToken(token)
    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: "登录已过期" },
        { status: 401 }
      )
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: tokenData.adminId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    })

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { success: false, error: "账号不存在或已被禁用" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: {
          id: admin.role.id,
          name: admin.role.name,
          label: admin.role.label,
        },
        permissions: admin.role.permissions.map((p) => p.name),
        lastLoginAt: admin.lastLoginAt,
      },
    })
  } catch (error) {
    console.error("获取管理员信息失败:", error)
    return NextResponse.json(
      { success: false, error: "获取信息失败" },
      { status: 500 }
    )
  }
}
