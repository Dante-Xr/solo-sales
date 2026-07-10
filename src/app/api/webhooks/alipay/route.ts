/**
 * ============================================
 * Alipay Webhook Handler (v1.7)
 * ============================================
 * 创建时间：2026-06-28 00:25:00 +08:00
 * 创建依据：v1.7规范 - Alipay闭环
 * 功能说明：
 *   - 验证支付宝webhook签名
 *   - 处理支付成功/失败事件
 *   - 集成order-state-machine
 *   - 幂等性保证
 * ============================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { PaymentProviderFactory } from '@/server/payments/factory'
import { handlePaymentSuccess, findPaymentByTransactionId } from '@/server/services/order-state-machine'

export async function POST(req: NextRequest) {
  try {
    // 1. 解析form数据
    const formData = await req.formData()
    const params: Record<string, string> = {}

    // Convert FormData to plain object
    for (const [key, value] of formData.entries()) {
      params[key] = value.toString()
    }

    const signature = params.sign as string

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // 2. 验证签名 - 传递JSON字符串
    const provider = PaymentProviderFactory.getProvider('alipay')
    const event = await provider.verifyWebhook(JSON.stringify(params), signature)

    // 3. 幂等性检查
    const existingPayment = await findPaymentByTransactionId(
      'alipay',
      event.transactionId
    )

    if (existingPayment?.status === 'COMPLETED') {
      console.info('Alipay webhook already processed:', event.transactionId)
      return new Response('success') // Alipay requires 'success' response
    }

    // 4. 处理支付事件
    switch (event.type) {
      case 'payment.success':
        await handlePaymentSuccess({
          orderId: event.orderId,
          transactionId: event.transactionId,
          amount: event.amount,
          provider: 'alipay'
        })
        console.info('Alipay payment success processed:', event.orderId)
        break

      case 'payment.failed':
      case 'payment.cancelled':
        console.info('Alipay payment failed/cancelled:', event.orderId, event.type)
        break

      default:
        console.warn('Unhandled Alipay webhook event type:', event.type)
    }

    // Alipay expects 'success' string response
    return new Response('success')
  } catch (error: unknown) {
    console.error('Alipay webhook error:', error)

    if (error instanceof Error && error.message.includes('signature')) {
      return new Response('failure', { status: 400 })
    }

    return new Response('failure', { status: 500 })
  }
}
