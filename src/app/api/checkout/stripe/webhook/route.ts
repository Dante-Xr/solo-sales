/**
 * Stripe Webhook 处理路由
 * 功能：接收 Stripe 事件通知，验证签名后更新订单和支付状态
 * 事件：
 *   checkout.session.completed - 支付成功后更新订单状态为 PAID
 * 安全：
 *   使用原始 body 验证 Webhook 签名，防止伪造请求
 */
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

/**
 * 获取 Stripe 实例
 * Webhook 路由独立实例化，避免与 checkout 路由耦合
 */
function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey || (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_"))) {
    throw new Error("STRIPE_SECRET_KEY 未配置或格式无效")
  }
  return new Stripe(secretKey, {
    apiVersion: "2026-02-25.clover",
  })
}

/**
 * 处理 checkout.session.completed 事件
 * 支付成功后：更新订单状态为 PAID，创建支付记录
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const sessionId = session.id
  const amountTotal = session.amount_total
  const currency = session.currency?.toUpperCase() || "USD"
  const paymentIntentId = session.payment_intent as string | null
  const productId = session.metadata?.productId
  const customerEmail = session.customer_details?.email

  if (!amountTotal || amountTotal <= 0) {
    console.error("Webhook: 无效的支付金额", { sessionId, amountTotal })
    return
  }

  const amountInDollars = (amountTotal / 100).toFixed(2)

  // 查找关联订单：通过 metadata 中的 productId 或 session_id 匹配
  // 此处假设订单在创建 checkout session 前已创建
  // 如果没有预创建订单，则在此创建
  let order = await prisma.order.findFirst({
    where: {
      payments: {
        some: { transactionId: sessionId },
      },
    },
  })

  if (order) {
    // 订单已存在，更新状态
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    })
  } else {
    // 订单不存在，创建新订单
    // 需要关联用户：通过邮箱查找或创建
    let userId: string | undefined

    if (customerEmail) {
      const user = await prisma.user.findUnique({ where: { email: customerEmail } })
      if (user) userId = user.id
    }

    if (!userId) {
      console.error("Webhook: 无法确定订单所属用户", { sessionId, customerEmail })
      return
    }

    order = await prisma.order.create({
      data: {
        userId,
        totalAmount: parseFloat(amountInDollars),
        status: "PAID",
        paymentMethod: "stripe",
        items: productId
          ? {
              create: {
                productId,
                quantity: 1,
                price: parseFloat(amountInDollars),
              },
            }
          : undefined,
      },
    })
  }

  // 创建支付记录（幂等：检查是否已存在）
  const existingPayment = await prisma.payment.findFirst({
    where: { transactionId: sessionId },
  })

  if (!existingPayment) {
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: parseFloat(amountInDollars),
        currency,
        status: "COMPLETED",
        provider: "stripe",
        transactionId: paymentIntentId || sessionId,
      },
    })
  }

  console.log("Webhook: 订单支付成功", {
    orderId: order.id,
    sessionId,
    amount: amountInDollars,
  })
}

/**
 * POST 处理器 - 接收 Stripe Webhook 事件
 * 必须使用原始 body 验证签名
 */
export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "缺少 Stripe 签名" }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET 未配置")
    return NextResponse.json({ error: "Webhook 配置缺失" }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("Webhook 签名验证失败:", err)
    return NextResponse.json({ error: "签名验证失败" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }
      default:
        console.log("Webhook: 忽略事件类型", event.type)
    }
  } catch (err) {
    console.error("Webhook 处理错误:", err)
    return NextResponse.json({ error: "处理失败" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
