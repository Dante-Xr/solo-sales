/**
 * 修改时间：2026-06-04 16:40:36 +08:00
 * 修改内容：强化 Stripe Webhook 幂等边界，将订单/支付双写包入事务并兼容唯一约束冲突重放。
 * 修改模型：gpt-5.5
 */
import "server-only"

import { Prisma } from "@prisma/client"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { AppError, ErrorCodes, notFound, validationError } from "@/server/contracts/errors"
import { getStripe, isStripeTestMode } from "@/server/payments/stripe"

interface CreateStripeCheckoutInput {
  productId: string
  quantity: number
  origin: string
  userId?: string
  userEmail?: string | null
}

export async function createStripeCheckoutSession(input: CreateStripeCheckoutInput) {
  if (!input.productId || !Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw validationError("支付参数无效", {
      productId: input.productId,
      quantity: input.quantity,
    })
  }

  const product = await prisma.product.findFirst({
    where: {
      id: input.productId,
      isPublished: true,
    },
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
    },
  })

  if (!product) {
    throw notFound("商品")
  }

  if (product.stock < input.quantity) {
    throw new AppError(
      ErrorCodes.INSUFFICIENT_STOCK,
      `商品「${product.name}」库存不足，当前库存: ${product.stock}`,
      422,
      undefined,
      false
    )
  }

  try {
    const stripe = getStripe()
    // Checkout Session 的商品名称和金额都来自数据库，前端只负责传 productId/quantity。
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
            },
            unit_amount: product.price.mul(100).toDecimalPlaces(0).toNumber(),
          },
          quantity: input.quantity,
        },
      ],
      mode: "payment",
      success_url: `${input.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${input.origin}/`,
      metadata: {
        productId: product.id,
        quantity: String(input.quantity),
        ...(input.userId ? { userId: input.userId } : {}),
      },
      ...(input.userEmail ? { customer_email: input.userEmail } : {}),
    })

    return {
      sessionId: session.id,
      url: session.url,
      isTestMode: isStripeTestMode(),
    }
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(
      ErrorCodes.PAYMENT_PROVIDER_ERROR,
      "支付服务暂时不可用，请稍后重试",
      502,
      error,
      true
    )
  }
}

export function constructStripeWebhookEvent(body: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new AppError(
      ErrorCodes.PAYMENT_CONFIGURATION_ERROR,
      "Webhook 配置缺失",
      500
    )
  }

  try {
    // 必须使用原始 body 和 Stripe 签名密钥验证事件，不能先 JSON.parse。
    return getStripe().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error: unknown) {
    throw new AppError(
      ErrorCodes.PAYMENT_WEBHOOK_SIGNATURE_ERROR,
      "签名验证失败",
      400,
      error,
      false
    )
  }
}

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  // 当前 P0 只处理支付完成事件，其他事件显式标记为 ignored，方便后续扩展。
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutSessionCompleted(session)
      return { received: true, ignored: false }
    }
    default:
      return { received: true, ignored: true }
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // Stripe 金额单位是分，这里只在服务端转换为数据库订单/支付记录的美元金额。
  const sessionId = session.id
  const amountTotal = session.amount_total
  const currency = session.currency?.toUpperCase() || "USD"
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : null
  const productId = session.metadata?.productId
  const quantity = Number(session.metadata?.quantity ?? 1)
  const userId = session.metadata?.userId
  const customerEmail = session.customer_details?.email

  if (!amountTotal || amountTotal <= 0) {
    throw validationError("无效的支付金额", { sessionId, amountTotal })
  }

  const transactionId = paymentIntentId || sessionId
  const existingPayment = await prisma.payment.findFirst({
    where: {
      OR: [{ transactionId }, { transactionId: sessionId }],
    },
    include: { order: true },
  })

  if (existingPayment) {
    // Webhook 可能重试投递；已存在支付记录时只确保订单状态正确，不重复创建 Payment。
    await prisma.order.update({
      where: { id: existingPayment.orderId },
      data: { status: "PAID", paymentMethod: "stripe" },
    })
    return
  }

  const amountInDollars = amountTotal / 100

  try {
    await prisma.$transaction(async (tx) => {
      let order = await tx.order.findFirst({
        where: {
          payments: {
            some: {
              OR: [{ transactionId }, { transactionId: sessionId }],
            },
          },
        },
      })

      if (!order) {
        // 兼容未预创建订单的 Checkout 流程：用 metadata 里的商品信息补建订单。
        if (!productId) {
          throw validationError("Webhook 缺少商品信息", { sessionId })
        }

        const product = await tx.product.findUnique({
          where: { id: productId },
          select: { id: true, price: true },
        })

        if (!product) {
          throw notFound("商品")
        }

        const orderUserId = await resolveStripeCustomerUserId(tx, userId, customerEmail)

        order = await tx.order.create({
          data: {
            userId: orderUserId,
            totalAmount: amountInDollars,
            status: "PAID",
            paymentMethod: "stripe",
            items: {
              create: {
                productId: product.id,
                quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
                price: product.price,
              },
            },
          },
        })
      } else {
        await tx.order.update({
          where: { id: order.id },
          data: { status: "PAID", paymentMethod: "stripe" },
        })
      }

      await tx.payment.create({
        // transactionId 使用 PaymentIntent 优先，便于和 Stripe 后台流水对账。
        data: {
          orderId: order.id,
          amount: amountInDollars,
          currency,
          status: "COMPLETED",
          provider: "stripe",
          transactionId,
        },
      })
    })
  } catch (error: unknown) {
    if (isUniquePaymentTransactionError(error)) {
      const duplicatedPayment = await prisma.payment.findFirst({
        where: { provider: "stripe", transactionId },
        include: { order: true },
      })
      if (duplicatedPayment) {
        await prisma.order.update({
          where: { id: duplicatedPayment.orderId },
          data: { status: "PAID", paymentMethod: "stripe" },
        })
        return
      }
    }

    throw error
  }
}

async function resolveStripeCustomerUserId(
  tx: Prisma.TransactionClient,
  metadataUserId?: string | null,
  customerEmail?: string | null
): Promise<string> {
  if (metadataUserId) {
    return metadataUserId
  }

  if (customerEmail) {
    const user = await tx.user.findUnique({ where: { email: customerEmail } })
    if (user?.id) return user.id
  }

  throw validationError("Webhook 缺少用户绑定信息", { customerEmail })
}

function isUniquePaymentTransactionError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  )
}
