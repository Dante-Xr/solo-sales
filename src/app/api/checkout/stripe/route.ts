/**
 * Stripe 结账后端 API 路由
 * 功能：接收前台传来的商品信息，调用 Stripe API 生成 Checkout Session 并返回支付跳转链接
 * 安全措施：
 *   1. Zod 请求体验证：商品信息格式验证
 *   2. Rate Limiting：5分钟内最多支付 10 次
 *   3. 错误处理：不泄露 Stripe 内部错误信息
 * 环境变量：
 *   STRIPE_SECRET_KEY  - sk_test_xxx（测试模式）/ sk_live_xxx（生产模式），自动区分
 *   STRIPE_PUBLIC_KEY  - pk_test_xxx / pk_live_xxx，前端使用
 */
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { paymentRateLimiter } from "@/middleware/rate-limit"
import { stripeCheckoutSchema, parseWithValidation } from "@/lib/validators"
import { csrfGuard } from "@/middleware/csrf-guard"

/**
 * 判断当前是否为 Stripe 测试模式
 * 通过 STRIPE_SECRET_KEY 前缀自动识别：sk_test_ = 测试，sk_live_ = 生产
 */
export function isStripeTestMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY || ""
  return key.startsWith("sk_test_")
}

/**
 * 获取 Stripe 实例
 * 延迟初始化，仅在首次调用时创建
 * - sk_test_ 前缀自动进入测试模式
 * - sk_live_ 前缀自动进入生产模式
 * - 缺少 key 时抛出明确错误
 */
function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY 未配置。请在 .env 中设置 Stripe 密钥（sk_test_xxx 或 sk_live_xxx）"
    )
  }

  if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
    throw new Error(
      "STRIPE_SECRET_KEY 格式无效。必须以 sk_test_（测试）或 sk_live_（生产）开头"
    )
  }

  if (secretKey.startsWith("sk_live_") && process.env.NODE_ENV !== "production") {
    console.warn("⚠️ 当前使用 sk_live_ 密钥但非生产环境，请确认是否正确")
  }

  return new Stripe(secretKey, {
    apiVersion: "2026-02-25.clover",
  })
}

/**
 * POST 处理器 - 创建 Stripe Checkout Session
 * @param req - 包含 productId、productName、price、quantity 的请求体
 * @returns 包含 sessionId、支付链接和模式的 JSON 响应
 */
export async function POST(req: Request) {
  const csrfError = await csrfGuard(req)
  if (csrfError) return csrfError

  const rateLimitResult = paymentRateLimiter(req)
  if (!rateLimitResult.allowed && rateLimitResult.errorResponse) {
    return rateLimitResult.errorResponse
  }

  try {
    const body = await req.json()

    const validation = parseWithValidation(stripeCheckoutSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.errors[0].message, field: validation.errors[0].field },
        { status: 400 }
      )
    }

    const { productName, price, quantity } = validation.data

    const origin = req.headers.get("origin") || "http://localhost:3000"

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity,
        },
      ],
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata: {
        productId: validation.data.productId,
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      isTestMode: isStripeTestMode(),
    })
  } catch (error) {
    console.error("Stripe Error:", error)
    const message =
      error instanceof Error && error.message.includes("STRIPE_SECRET_KEY")
        ? error.message
        : "支付服务暂时不可用，请稍后重试"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
