/**
 * ============================================
 * Stripe Webhook Handler (Enhanced v1.7)
 * ============================================
 * 修改时间：2026-06-27 23:00:00 +08:00
 * 修改内容：集成v1.7订单状态机，增强幂等性和时间戳验证
 * 功能说明：
 *   - 验证webhook签名
 *   - 处理支付成功/失败事件
 *   - 集成order-state-machine
 *   - 时间戳验证（防重放攻击）
 * ============================================
 */
import { handleApiError, successResponse } from "@/server/contracts/api"
import { validationError } from "@/server/contracts/errors"
import { PaymentProviderFactory } from '@/server/payments/factory'
import { handlePaymentSuccess, findPaymentByTransactionId } from '@/server/services/order-state-machine'

export async function POST(request: Request) {
  try {
    // Webhook 签名校验必须读取 text 原文，不能使用 request.json()
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      throw validationError("缺少 Stripe 签名")
    }

    // 1. 使用v1.7 PaymentProvider验证签名
    const provider = PaymentProviderFactory.getProvider('stripe')
    const event = await provider.verifyWebhook(body, signature)

    // 2. 时间戳验证（防止重放攻击）
    const eventAge = Date.now() - event.timestamp.getTime()
    if (eventAge > 5 * 60 * 1000) { // 5分钟
      console.warn('Stripe webhook event too old:', event.transactionId, `${eventAge}ms`)
      return successResponse({ received: true, warning: 'Event too old' })
    }

    // 3. 幂等性检查（基于provider+transactionId）
    const existingPayment = await findPaymentByTransactionId(
      'stripe',
      event.transactionId
    )

    if (existingPayment?.status === 'COMPLETED') {
      console.info('Stripe webhook already processed:', event.transactionId)
      return successResponse({ received: true, idempotent: true })
    }

    // 4. 处理不同的支付事件
    switch (event.type) {
      case 'payment.success':
        await handlePaymentSuccess({
          orderId: event.orderId,
          transactionId: event.transactionId,
          amount: event.amount,
          provider: 'stripe'
        })
        console.info('Stripe payment success processed:', event.orderId)
        break

      case 'payment.failed':
      case 'payment.cancelled':
        // TODO: 实现支付失败处理（后续）
        console.info('Stripe payment failed/cancelled:', event.orderId, event.type)
        break

      default:
        console.warn('Unhandled Stripe webhook event type:', event.type)
    }

    return successResponse({ received: true })
  } catch (error) {
    return handleApiError(error)
  }
}
