import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
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

    return NextResponse.json(orders)
  } catch (error) {
    console.error("获取订单列表错误:", error)
    return NextResponse.json(
      { error: "获取订单列表失败" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { orderId, trackingNumber, status } = body

    if (!orderId) {
      return NextResponse.json(
        { error: "订单ID不能为空" },
        { status: 400 }
      )
    }

    const updateData: Record<string, string> = {}

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

    return NextResponse.json(order)
  } catch (error) {
    console.error("更新订单错误:", error)
    return NextResponse.json(
      { error: "更新订单失败" },
      { status: 500 }
    )
  }
}
