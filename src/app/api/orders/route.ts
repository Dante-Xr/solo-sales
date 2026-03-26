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

    // 使用事务和乐观锁防止并发库存超卖
    const order = await prisma.$transaction(async (tx) => {
      // 验证并扣减每个商品的库存
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, name: true },
        })

        if (!product) {
          throw new Error(`商品不存在: ${item.productId}`)
        }

        if (product.stock < item.quantity) {
          throw new Error(`商品「${product.name}」库存不足，当前库存: ${product.stock}`)
        }

        // 使用乐观锁扣减库存
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity }, // 乐观锁条件
          },
          data: {
            stock: { decrement: item.quantity },
          },
        })

        if (updated.count === 0) {
          throw new Error(`商品「${product.name}」库存不足，请重试`)
        }
      }

      // 创建订单
      return tx.order.create({
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
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("创建订单错误:", error instanceof Error ? error.message : "Unknown")
    return NextResponse.json(
      { error: "创建订单失败，请稍后重试" },
      { status: 500 }
    )
  }
}
