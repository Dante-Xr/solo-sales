/**
 * ============================================
 * 获取当前管理员信息 API
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const ADMIN_COOKIE_NAME = "admin_token"

function parseToken(token: string): { adminId: string } | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const payload = JSON.parse(decoded)
    return { adminId: payload.adminId }
  } catch {
    return null
  }
}

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
        permissions: admin.role.permissions.map((p: { name: string }) => p.name),
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