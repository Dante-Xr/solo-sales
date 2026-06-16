/**
 * 修改时间：2026-05-02 19:16:38 +08:00
 * 修改内容：统一客户详情路由响应与错误处理，改用 Prisma 单例并修复乱码错误文案。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { notFound } from "@/server/contracts/errors"
import { requireAdminPermission } from "@/server/services/admin-service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(request, "customers.view")
    const { id } = await params

    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
        orders: {
          // 详情页只展示最近 10 笔订单摘要，避免一次性加载客户全量订单。
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    })

    if (!customer) throw notFound("客户")

    return successResponse(customer)
  } catch (error) {
    return handleApiError(error)
  }
}
