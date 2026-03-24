/**
 * 2026-03-24: Stripe 结账后端 API 路由
 * 功能：接收前台传来的商品信息，调用 Stripe API 生成 Checkout Session 并返回支付跳转链接
 * 安全措施：
 *   1. Zod 请求体验证：商品信息格式验证
 *   2. Rate Limiting：5分钟内最多支付 10 次
 *   3. 错误处理：不泄露 Stripe 内部错误信息
 * 注意：Stripe Key 验证在运行时进行，开发环境允许使用 Mock Key
 */
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { paymentRateLimiter } from "@/middleware/rate-limit"
import { stripeCheckoutSchema, parseWithValidation } from "@/lib/validators"

/**
 * 2026-03-24: 获取 Stripe 实例
 * 延迟初始化，仅在首次调用时创建
 * 开发环境允许使用 Mock Key，生产环境必须提供真实 Key
 */
function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY

  // 2026-03-24: 检查是否提供了 Stripe Key
  if (!secretKey) {
    // 2026-03-24: 未提供 Key，使用 Mock 模式（仅用于开发）
    console.warn("STRIPE_SECRET_KEY 未配置，使用 Mock Stripe 模式")
    return new Stripe("sk_test_mock", {
      apiVersion: "2026-02-25.clover",
    })
  }

  // 2026-03-24: 检查是否为 Mock Key
  if (secretKey === "sk_test_mock" || secretKey.includes("mock")) {
    // 2026-03-24: 检测到 Mock Key，可能仍在开发环境
    if (process.env.NODE_ENV === "production") {
      throw new Error("生产环境禁止使用 Mock Stripe Key，请配置真实的 STRIPE_SECRET_KEY")
    }
    console.warn("检测到 Mock Stripe Key，仅在开发环境可用")
    return new Stripe(secretKey, {
      apiVersion: "2026-02-25.clover",
    })
  }

  // 2026-03-24: 使用真实 Key 创建 Stripe 实例
  return new Stripe(secretKey, {
    apiVersion: "2026-02-25.clover",
  })
}

/**
 * 2026-03-24: POST 处理器 - 创建 Stripe Checkout Session
 * @param req - 包含 productId、productName、price、quantity 的请求体
 * @returns 包含 sessionId 和支付链接的 JSON 响应
 */
export async function POST(req: Request) {
  // 2026-03-24: 限流检查
  const rateLimitResult = paymentRateLimiter(req)
  if (!rateLimitResult.allowed && rateLimitResult.errorResponse) {
    return rateLimitResult.errorResponse
  }

  try {
    const body = await req.json()

    // 2026-03-24: 使用 Zod 验证请求体
    const validation = parseWithValidation(stripeCheckoutSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.errors[0].message, field: validation.errors[0].field },
        { status: 400 }
      )
    }

    const { productName, price, quantity } = validation.data

    // 2026-03-24: 从请求头中获取当前站点 origin，用于拼接 success/cancel 回跳 URL
    const origin = req.headers.get("origin") || "http://localhost:3000"

    // 2026-03-24: 获取 Stripe 实例并创建结账会话
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // 仅限信用卡支付
      line_items: [
        {
          price_data: {
            currency: "usd", // 统一使用美元结算
            product_data: {
              name: productName, // 商品名称
            },
            unit_amount: Math.round(price * 100), // Stripe 使用"美分"为单位，需乘以100
          },
          quantity,
        },
      ],
      mode: "payment", // 非订阅模式，单次付款
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`, // 支付成功后跳转
      cancel_url: `${origin}/`, // 支付取消后跳转回商品页
    })

    // 2026-03-24: 返回 session ID 和 Stripe 托管页面的 URL 给前端
    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    // 2026-03-24: 错误日志记录，不泄露敏感信息
    console.error("Stripe Error:", error)
    // 2026-03-24: 返回通用错误信息，不暴露 Stripe 内部细节
    return NextResponse.json(
      { error: "支付服务暂时不可用，请稍后重试" },
      { status: 500 }
    )
  }
}
