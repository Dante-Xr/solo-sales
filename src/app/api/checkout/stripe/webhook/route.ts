/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：将 Stripe Webhook 路由收敛为薄控制器，统一签名校验、事件处理和标准响应。
 * 修改模型：gpt-5.5
 */
import { handleApiError, successResponse } from "@/server/contracts/api"
import { validationError } from "@/server/contracts/errors"
import {
  constructStripeWebhookEvent,
  handleStripeWebhookEvent,
} from "@/server/services/payment-service"

export async function POST(request: Request) {
  try {
    // Webhook 签名校验必须读取 text 原文，不能使用 request.json()。
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      throw validationError("缺少 Stripe 签名")
    }

    const event = constructStripeWebhookEvent(body, signature)
    const result = await handleStripeWebhookEvent(event)

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
