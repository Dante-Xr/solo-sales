import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      )
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email: session.user.email },
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
