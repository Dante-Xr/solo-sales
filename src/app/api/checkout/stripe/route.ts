/**
 * 2026-03-23: Stripe 结账后端 API 路由
 * 作用：接收前台传来的商品信息，调用 Stripe API 生成 Checkout Session 并返回支付跳转链接
 * 逻辑：
 *   1. 解析 POST 请求体中的 productId、productName、price、quantity
 *   2. 使用 Stripe SDK 创建 checkout.sessions，配置支付方式为 card
 *   3. 指定 success_url（支付成功跳转页）和 cancel_url（取消支付跳转页）
 *   4. 返回 session.id 和 session.url 给前端，前端据此完成跳转
 */
import { NextResponse } from "next/server"
import Stripe from "stripe"

/**
 * 2026-03-23: 初始化 Stripe 实例
 * 注意：生产环境应将 sk_test_mock 替换为真实的 STRIPE_SECRET_KEY 环境变量
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2026-02-25.clover",
})

/**
 * 2026-03-23: POST 处理器 - 创建 Stripe Checkout Session
 * @param req - 包含 productId、productName、price、quantity 的请求体
 * @returns 包含 sessionId 和支付链接的 JSON 响应
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { productId, productName, price, quantity = 1 } = body

    // 2026-03-23: 从请求头中获取当前站点 origin，用于拼接 success/cancel 回跳 URL
    const origin = req.headers.get("origin") || "http://localhost:3000"

    // 2026-03-23: 调用 Stripe SDK 创建托管结账页面会话
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

    // 2026-03-23: 返回 session ID 和 Stripe 托管页面的 URL 给前端
    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error("Stripe Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
