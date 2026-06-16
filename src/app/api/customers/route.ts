/**
 * 修改时间：2026-05-02 19:16:38 +08:00
 * 修改内容：统一客户列表路由响应与错误处理，改用 Prisma 单例并清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 客户列表 API
 * ============================================
 */

import { NextRequest } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { requireAdminPermission } from "@/server/services/admin-service"

/**
 * GET handler - 获取客户列表
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "customers.view")
    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get("keyword")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    const where: Prisma.UserWhereInput = {}

    if (keyword) {
      // 后台客户搜索只匹配邮箱和昵称，保持原有查询口径不扩大数据面。
      where.OR = [
        { email: { contains: keyword, mode: "insensitive" } },
        { name: { contains: keyword, mode: "insensitive" } },
      ]
    }

    const [list, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: { orders: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return successResponse({
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
