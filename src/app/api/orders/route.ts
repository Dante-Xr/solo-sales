/**
 * ============================================
 * 订单 API 路由 (Phase 2 安全修复)
 * ============================================
 * 功能说明：
 *   - GET /api/orders: 获取订单列表或单个订单详情
 *   - POST /api/orders: 创建新订单
 *
 * 认证变更：
 *   - 之前使用 getServerSession + NextAuth
 *   - 现在使用 Better Auth 的 auth.api.getSession
 * ============================================
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { csrfGuard } from "@/middleware/csrf-guard"

/**
 * GET /api/orders
 *
 * 查询参数：
 *   - id: 订单 ID（可选），存在时返回单个订单，否则返回当前用户所有订单
 *
 * 认证：
 *   - 查询特定订单：无需登录（但只能查看自己的订单）
 *   - 查询订单列表：需要 Better Auth Session
 */
export async function GET(request: Request) {
  try {
    // 使用 Better Auth 获取会话
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("id")

    // 查询单个订单
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

      return NextResponse.json(order, { status: 201 })
    }

    // 查询订单列表需要登录
    if (!session) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      )
    }

    // 获取当前用户的订单列表
    const orders = await prisma.order.findMany({
      where: { userId: (session.user as { id?: string }).id ?? "" },
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

/**
 * POST /api/orders
 *
 * 创建新订单
 *
 * 请求体：
 *   - items: 商品列表 [{ productId, quantity, price }]
 *   - totalAmount: 订单总金额
 *   - shippingAddress: 收货地址
 *   - contactInfo: 联系信息
 *
 * 认证：
 *   - 可选登录，登录时绑定用户 ID
 *   - 未登录时 userId 为 "guest"
 *
 * 库存处理：
 *   - 事务中扣减库存
 *   - 库存不足时抛出错误
 */
export async function POST(request: Request) {
  const csrfError = await csrfGuard(request)
  if (csrfError) return csrfError

  try {
    const body = await request.json()
    const { items, totalAmount, shippingAddress, contactInfo } = body

    // 验证订单商品
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "订单商品不能为空" },
        { status: 400 }
      )
    }

    // 验证订单金额
    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { error: "订单金额无效" },
        { status: 400 }
      )
    }

    // 验证收货信息
    if (!shippingAddress || !contactInfo) {
      return NextResponse.json(
        { error: "收货信息不完整" },
        { status: 400 }
      )
    }

    // 获取当前用户 ID（可选）
    let userId: string | null = null
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (session) {
      const userIdFromSession = (session.user as { id?: string }).id
      userId = userIdFromSession !== undefined ? userIdFromSession : null
    }

    // 使用事务创建订单并扣减库存
    const order = await prisma.$transaction(async (tx) => {
      // 遍历订单商品，扣减库存
      for (const item of items) {
        // 查询商品库存
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, name: true },
        })

        if (!product) {
          throw new Error(`商品不存在: ${item.productId}`)
        }

        // 检查库存是否充足
        if (product.stock < item.quantity) {
          throw new Error(`商品「${product.name}」库存不足，当前库存: ${product.stock}`)
        }

        // 扣减库存
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        })

        // 库存扣减失败（并发问题）
        if (updated.count === 0) {
          throw new Error(`商品「${product.name}」库存不足，请重试`)
        }
      }

      // 创建订单
      return tx.order.create({
        data: {
          userId: userId || "guest", // 未登录时使用 "guest"
          totalAmount,
          status: "PENDING",
          shippingAddress,
          items: {
            create: items.map((item: { productId: string; quantity: number; price: number }) => ({
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
