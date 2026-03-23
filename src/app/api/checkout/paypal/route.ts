/**
 * 2026-03-23: PayPal 结账后端 API 路由
 * 作用：接收前台传来的商品价格信息，调用 PayPal API 创建订单（Order）并返回订单 ID
 * 逻辑：
 *   1. 解析 POST 请求体中的 price 和 quantity
 *   2. 计算订单总金额
 *   3. 调用 PayPal SDK 创建订单（当前为 Mock 模式，返回模拟 ID）
 *   4. 未来正式接入时需使用 @paypal/checkout-server-sdk 并配置真实 Client ID 和 Secret
 */
import { NextResponse } from "next/server"

// 2026-03-23: 模拟 PayPal API，实际项目中需要安装并使用 @paypal/checkout-server-sdk
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { price, quantity = 1 } = body
    const totalAmount = price * quantity

    // 2026-03-23: 正式项目中的 PayPal SDK 调用示例（已注释）
    // const request = new paypal.orders.OrdersCreateRequest()
    // request.requestBody({ ... })
    // const response = await client().execute(request)
    // return NextResponse.json({ orderId: response.result.id })

    // 2026-03-23: Mock 模式：生成一个模拟的 PayPal Order ID 用于演示流程
    const mockOrderId = `PAYPAL-MOCK-${Date.now()}`

    return NextResponse.json({ orderId: mockOrderId, amount: totalAmount })
  } catch (error: any) {
    console.error("PayPal Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
