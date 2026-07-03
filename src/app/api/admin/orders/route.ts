/**
 * 修改时间：2026-05-02 19:00:54 +08:00
 * 修改内容：统一后台订单路由响应与错误处理，清理手写 NextResponse.json 模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest } from "@/server/contracts/errors"
import { requireAdminPermission } from "@/server/services/admin-service"

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "orders.view")

    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return successResponse(orders)
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdminPermission(request, "orders.update")

    const body = await request.json()
    const { orderId, trackingNumber, status } = body

    if (!orderId) {
      throw badRequest("订单ID不能为空")
    }

    const updateData: Record<string, string> = {}

    // 只允许后台订单页更新物流单号和状态，避免透传未知字段污染订单记录。
    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber
    }

    if (status) {
      updateData.status = status
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    })

    return successResponse(order)
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
