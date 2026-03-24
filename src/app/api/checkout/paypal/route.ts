/**
 * 2026-03-24: PayPal 结账后端 API 路由
 * 功能：接收前台传来的商品价格信息，调用 PayPal API 创建订单（Order）并返回订单 ID
 * 安全措施：
 *   1. Zod 请求体验证：金额和数量格式验证
 *   2. Rate Limiting：5分钟内最多支付 10 次
 *   3. 错误处理：不泄露内部错误信息
 */
import { NextResponse } from "next/server"
import { paymentRateLimiter } from "@/middleware/rate-limit"
import { paypalCheckoutSchema, parseWithValidation } from "@/lib/validators"

// 2026-03-24: 模拟 PayPal API，实际项目中需要安装并使用 @paypal/checkout-server-sdk
export async function POST(req: Request) {
  // 2026-03-24: 限流检查
  const rateLimitResult = paymentRateLimiter(req)
  if (!rateLimitResult.allowed && rateLimitResult.errorResponse) {
    return rateLimitResult.errorResponse
  }

  try {
    const body = await req.json()

    // 2026-03-24: 使用 Zod 验证请求体
    const validation = parseWithValidation(paypalCheckoutSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.errors[0].message, field: validation.errors[0].field },
        { status: 400 }
      )
    }

    const { price, quantity } = validation.data
    const totalAmount = price * quantity

    // 2026-03-24: 正式项目中的 PayPal SDK 调用示例（已注释）
    // const request = new paypal.orders.OrdersCreateRequest()
    // request.requestBody({ ... })
    // const response = await client().execute(request)
    // return NextResponse.json({ orderId: response.result.id })

    // 2026-03-24: Mock 模式：生成一个模拟的 PayPal Order ID 用于演示流程
    const mockOrderId = `PAYPAL-MOCK-${Date.now()}`

    return NextResponse.json({ orderId: mockOrderId, amount: totalAmount })
  } catch (error) {
    // 2026-03-24: 错误日志，不泄露敏感信息
    console.error("PayPal Error:", error)
    return NextResponse.json(
      { error: "支付服务暂时不可用，请稍后重试" },
      { status: 500 }
    )
  }
}
