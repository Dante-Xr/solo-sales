/**
 * 修改时间：2026-06-04 16:40:36 +08:00
 * 修改内容：新增订单创建幂等键支持，用稳定订单 ID 处理重复下单，并补强库存竞争失败语义。
 * 修改模型：gpt-5.5
 */
import "server-only"

import { createHash } from "node:crypto"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { ErrorCodes, forbidden, notFound, unauthorized, unprocessable, validationError } from "@/server/contracts/errors"
import { findOrderById, findOrdersByUserId, findProductsForOrder } from "@/server/repositories/order-repository"
import type { ServerSessionUser } from "@/server/auth/session"

const orderItemInputSchema = z.object({
  productId: z.string().min(1, "商品ID不能为空"),
  quantity: z.number().int("数量必须是整数").positive("数量必须大于0").max(99, "数量超出允许范围"),
})

export const createOrderInputSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, "订单商品不能为空"),
  shippingAddress: z.string().min(1, "收货地址不能为空"),
  contactInfo: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email("邮箱格式不正确").optional(),
    })
    .optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>
export interface CreateOrderOptions {
  idempotencyKey?: string | null
}

export function parseCreateOrderInput(body: unknown): CreateOrderInput {
  // 输入 schema 会剥离 price/totalAmount 等非白名单字段，形成订单金额信任边界。
  const result = createOrderInputSchema.safeParse(body)

  if (!result.success) {
    throw validationError("订单参数无效", result.error.flatten())
  }

  return result.data
}

export async function listOrdersForUser(sessionUser: ServerSessionUser | null) {
  if (!sessionUser?.id) {
    throw unauthorized("请先登录")
  }

  return findOrdersByUserId(prisma, sessionUser.id)
}

export async function getOrderByIdForViewer(
  orderId: string,
  sessionUser: ServerSessionUser | null
) {
  const order = await findOrderById(prisma, orderId)

  if (!order) {
    throw notFound("订单")
  }

  const isAdmin = sessionUser?.role === "admin"
  if (order.userId !== sessionUser?.id && !isAdmin) {
    throw sessionUser ? forbidden("无权查看此订单") : unauthorized("请先登录")
  }

  return order
}

async function resolveOrderUserId(
  tx: Prisma.TransactionClient,
  sessionUser: ServerSessionUser
) {
  // v1.6 起下单必须登录，订单用户身份只来自服务端会话。
  if (sessionUser?.id) {
    return sessionUser.id
  }

  throw unauthorized("请先登录")
}

export async function createOrder(
  input: CreateOrderInput,
  sessionUser: ServerSessionUser | null,
  options: CreateOrderOptions = {}
) {
  if (!sessionUser?.id) {
    throw unauthorized("请先登录")
  }

  const idempotentOrderId = buildIdempotentOrderId(input, sessionUser, options.idempotencyKey)
  if (idempotentOrderId) {
    const existingOrder = await findOrderById(prisma, idempotentOrderId)
    if (existingOrder) return existingOrder
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // 在同一个事务里读取商品、校验库存、扣减库存和创建订单，降低并发超卖风险。
      const uniqueProductIds = [...new Set(input.items.map((item) => item.productId))]
      const products = await findProductsForOrder(tx, uniqueProductIds)
      const productsById = new Map(products.map((product) => [product.id, product]))

      const orderItems = input.items.map((item) => {
        const product = productsById.get(item.productId)

        if (!product) {
          throw notFound(`商品 ${item.productId}`)
        }

        if (product.stock < item.quantity) {
          throw unprocessable(
            ErrorCodes.INSUFFICIENT_STOCK,
            `商品「${product.name}」库存不足，当前库存: ${product.stock}`
          )
        }

        return {
          product,
          quantity: item.quantity,
          price: new Prisma.Decimal(product.price),
          // 金额信任边界：订单金额只按数据库价格和数量计算，忽略客户端 totalAmount/price。
          lineTotal: new Prisma.Decimal(product.price).mul(item.quantity),
        }
      })

      for (const item of orderItems) {
        // updateMany 带 stock >= quantity 条件，作为并发扣库存的最后防线。
        const updated = await tx.product.updateMany({
          where: {
            id: item.product.id,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        })

        if (updated.count === 0) {
          throw unprocessable(
            ErrorCodes.INSUFFICIENT_STOCK,
            `商品「${item.product.name}」库存不足，请重试`
          )
        }
      }

      const totalAmount = orderItems.reduce(
        (sum, item) => sum.add(item.lineTotal),
        new Prisma.Decimal(0)
      )
      const userId = await resolveOrderUserId(tx, sessionUser)

      return tx.order.create({
        data: {
          ...(idempotentOrderId ? { id: idempotentOrderId } : {}),
          userId,
          totalAmount,
          status: "PENDING",
          shippingAddress: input.shippingAddress,
          items: {
            create: orderItems.map((item) => ({
              productId: item.product.id,
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
  } catch (error: unknown) {
    const duplicatedOrder = await findDuplicatedIdempotentOrder(error, idempotentOrderId)
    if (duplicatedOrder) return duplicatedOrder
    throw error
  }
}

function buildIdempotentOrderId(
  input: CreateOrderInput,
  sessionUser: ServerSessionUser | null,
  idempotencyKey?: string | null
): string | null {
  const key = idempotencyKey?.trim()
  if (!key) return null

  const identity =
    sessionUser?.id ||
    sessionUser?.email ||
    input.contactInfo?.email
  const payload = {
    identity,
    key,
    shippingAddress: input.shippingAddress,
    items: [...input.items].sort((a, b) => a.productId.localeCompare(b.productId)),
  }
  const digest = createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 24)

  // 不新增数据库表时，用稳定订单 ID 承载幂等结果；同一用户、同一幂等键、同一订单输入只会得到同一个订单。
  return `ord_${digest}`
}

async function findDuplicatedIdempotentOrder(error: unknown, orderId: string | null) {
  if (!orderId || !isUniqueConstraintError(error)) return null
  return findOrderById(prisma, orderId)
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  )
}
