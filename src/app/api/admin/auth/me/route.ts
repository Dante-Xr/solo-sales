/**
 * 修改时间：2026-05-02 19:00:54 +08:00
 * 修改内容：统一管理员当前用户信息路由响应与错误处理，清理手写错误响应模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { unauthorized } from "@/server/contracts/errors"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      throw unauthorized("未登录")
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
      throw unauthorized("账号不存在或已被禁用")
    }

    return successResponse({
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
    })
  } catch (error) {
    return handleApiError(error)
  }
}
