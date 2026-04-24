import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 })
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (session) {
      const userId = (session.user as { id?: string }).id
      const userRole = (session.user as { role?: string }).role
      if (order.userId !== userId && userRole !== "admin") {
        return NextResponse.json({ error: "无权查看此订单" }, { status: 403 })
      }
    } else if (order.userId !== "guest") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("获取订单详情错误:", error)
    return NextResponse.json(
      { error: "获取订单详情失败" },
      { status: 500 }
    )
  }
}
