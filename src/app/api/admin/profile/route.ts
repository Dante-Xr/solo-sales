/**
 * ============================================
 * 管理员个人资料管理 API
 * ============================================
 * 功能说明：
 *   - GET: 获取当前管理员资料
 *   - PUT: 更新管理员资料（用户名、密码）
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const ADMIN_COOKIE_NAME = "admin_token"

interface TokenPayload {
  adminId: string
  timestamp: number
  random: string
}

function parseToken(token: string): TokenPayload | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    return JSON.parse(decoded) as TokenPayload
  } catch {
    return null
  }
}

/**
 * 获取当前管理员资料
 * 从 cookie 中获取 token，解析后查询数据库返回管理员信息
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
        role: true,
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
        lastLoginAt: admin.lastLoginAt,
      },
    })
  } catch (error) {
    console.error("获取管理员资料失败:", error)
    return NextResponse.json(
      { success: false, error: "获取资料失败" },
      { status: 500 }
    )
  }
}

/**
 * 更新管理员资料
 * 支持更新用户名和密码（需验证旧密码）
 * 请求体格式：{ username?: string, oldPassword?: string, newPassword?: string }
 */
export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { username, oldPassword, newPassword } = body

    const admin = await prisma.adminUser.findUnique({
      where: { id: tokenData.adminId },
    })

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { success: false, error: "账号不存在或已被禁用" },
        { status: 401 }
      )
    }

    const updateData: { username?: string; password?: string } = {}

    if (username && username !== admin.username) {
      const existingUser = await prisma.adminUser.findFirst({
        where: {
          username,
          id: { not: admin.id },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "用户名已被使用" },
          { status: 400 }
        )
      }

      updateData.username = username
    }

    if (newPassword) {
      if (!oldPassword) {
        return NextResponse.json(
          { success: false, error: "请提供旧密码" },
          { status: 400 }
        )
      }

      const isOldPasswordValid = await bcrypt.compare(oldPassword, admin.password)
      if (!isOldPasswordValid) {
        return NextResponse.json(
          { success: false, error: "旧密码错误" },
          { status: 400 }
        )
      }

      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "没有需要更新的字段" },
        { status: 400 }
      )
    }

    const updatedAdmin = await prisma.adminUser.update({
      where: { id: admin.id },
      data: updateData,
      include: {
        role: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedAdmin.id,
        username: updatedAdmin.username,
        email: updatedAdmin.email,
        role: {
          id: updatedAdmin.role.id,
          name: updatedAdmin.role.name,
          label: updatedAdmin.role.label,
        },
        lastLoginAt: updatedAdmin.lastLoginAt,
      },
    })
  } catch (error) {
    console.error("更新管理员资料失败:", error)
    return NextResponse.json(
      { success: false, error: "更新资料失败" },
      { status: 500 }
    )
  }
}
