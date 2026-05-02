/**
 * 修改时间：2026-05-02 21:09:54 +08:00
 * 修改内容：统一 PayPal 结账路由响应与错误处理，清理旧响应注释以便剩余 route 扫描。
 * 修改模型：gpt-5.5
 *
 * 2026-03-24: PayPal 结账后端 API 路由
 * 功能：接收前台传来的商品价格信息，调用 PayPal API 创建订单（Order）并返回订单 ID
 * 安全措施：
 *   1. Zod 请求体验证：金额和数量格式验证
 *   2. Rate Limiting：5分钟内最多支付 10 次
 *   3. 错误处理：不泄露内部错误信息
 */
import { paymentRateLimiter } from "@/middleware/rate-limit"
import { paypalCheckoutSchema, parseWithValidation } from "@/lib/validators"
import { errorResponse, handleApiError, successResponse } from "@/server/contracts/api"
import { validationError } from "@/server/contracts/errors"

// 2026-03-24: 模拟 PayPal API，实际项目中需要安装并使用 @paypal/checkout-server-sdk
export async function POST(req: Request) {
  // 2026-03-24: 限流检查
  const rateLimitResult = paymentRateLimiter(req)
  if (!rateLimitResult.allowed) {
    // 限流分支也返回标准错误结构，同时保留 X-RateLimit-* 响应头供客户端判断重试时机。
    return errorResponse(
      { code: "TOO_MANY_REQUESTS", message: "请求过于频繁，请稍后再试" },
      429,
      { headers: rateLimitResult.headers }
    )
  }

  try {
    const body = await req.json()

    // 2026-03-24: 使用 Zod 验证请求体
    const validation = parseWithValidation(paypalCheckoutSchema, body)
    if (!validation.success) {
      throw validationError(validation.errors[0].message, validation.errors[0])
    }

    const { price, quantity } = validation.data
    const totalAmount = price * quantity

    // 2026-03-24: 正式项目中的 PayPal SDK 调用示例（已注释）
    // const request = new paypal.orders.OrdersCreateRequest()
    // request.requestBody({ ... })
    // const response = await client().execute(request)
    // return successResponse({ orderId: response.result.id })

    // Mock 模式只生成演示订单号，正式接入 SDK 时仍复用下方标准响应结构。
    const mockOrderId = `PAYPAL-MOCK-${Date.now()}`

    return successResponse({ orderId: mockOrderId, amount: totalAmount, isDemo: true })
  } catch (error) {
    return handleApiError(error)
  }
}
