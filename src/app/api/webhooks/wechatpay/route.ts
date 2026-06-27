/**
 * ============================================
 * WeChat Pay Webhook Handler (v1.7)
 * ============================================
 * 创建时间：2026-06-28 00:30:00 +08:00
 * 创建依据：v1.7规范 - 微信支付闭环
 * 功能说明：
 *   - 验证微信支付webhook签名
 *   - 解密resource字段
 *   - 处理支付成功/失败事件
 *   - 集成order-state-machine
 * ============================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { PaymentProviderFactory } from '@/server/payments/factory'
import { handlePaymentSuccess, findPaymentByTransactionId } from '@/server/services/order-state-machine'

export async function POST(req: NextRequest) {
  try {
    // 1. 获取原始body和签名headers
    const rawBody = await req.text()
    const signature = req.headers.get('wechatpay-signature')
    const timestamp = req.headers.get('wechatpay-timestamp')
    const nonce = req.headers.get('wechatpay-nonce')

    if (!signature || !timestamp || !nonce) {
      return NextResponse.json(
        { code: 'FAIL', message: 'Missing signature headers' },
        { status: 400 }
      )
    }

    // 2. 验证签名并解密
    const provider = PaymentProviderFactory.getProvider('wechatpay')
    const event = await provider.verifyWebhook(rawBody, signature, {
      timestamp,
      nonce
    })

    // 3. 幂等性检查
    const existingPayment = await findPaymentByTransactionId(
      'wechatpay',
      event.transactionId
    )

    if (existingPayment?.status === 'COMPLETED') {
      console.info('WeChat webhook already processed:', event.transactionId)
      return NextResponse.json({ code: 'SUCCESS' })
    }

    // 4. 处理支付事件
    switch (event.type) {
      case 'payment.success':
        await handlePaymentSuccess({
          orderId: event.orderId,
          transactionId: event.transactionId,
          amount: event.amount,
          provider: 'wechatpay'
        })
        console.info('WeChat payment success processed:', event.orderId)
        break

      case 'payment.failed':
      case 'payment.cancelled':
        console.info('WeChat payment failed/cancelled:', event.orderId, event.type)
        break

      default:
        console.warn('Unhandled WeChat webhook event type:', event.type)
    }

    // WeChat requires JSON response with code: SUCCESS
    return NextResponse.json({ code: 'SUCCESS' })
  } catch (error) {
    console.error('WeChat webhook error:', error)

    if (error instanceof Error && error.message.includes('signature')) {
      return NextResponse.json(
        { code: 'FAIL', message: 'Signature verification failed' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { code: 'FAIL', message: 'Internal error' },
      { status: 500 }
    )
  }
}
