import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("id")

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
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
            },
          },
        },
      })

      if (!order) {
        return NextResponse.json({ error: "订单不存在" }, { status: 404 })
      }

      return NextResponse.json(order)
    }

    if (!session) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      )
    }

    const orders = await prisma.order.findMany({
      where: { userId: (session.user as any).id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("获取订单错误:", error)
    return NextResponse.json(
      { error: "获取订单失败" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, totalAmount, shippingAddress, contactInfo, isGuest } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "订单商品不能为空" },
        { status: 400 }
      )
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { error: "订单金额无效" },
        { status: 400 }
      )
    }

    if (!shippingAddress || !contactInfo) {
      return NextResponse.json(
        { error: "收货信息不完整" },
        { status: 400 }
      )
    }

    let userId: string | null = null
    const session = await getServerSession(authOptions)

    if (session) {
      userId = (session.user as any).id
    }

    const order = await prisma.order.create({
      data: {
        userId: userId || "guest",
        totalAmount,
        status: "PENDING",
        shippingAddress,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("创建订单错误:", error)
    return NextResponse.json(
      { error: "创建订单失败" },
      { status: 500 }
    )
  }
}
