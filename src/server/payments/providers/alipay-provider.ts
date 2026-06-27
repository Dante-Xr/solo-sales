/**
 * ============================================
 * Alipay Payment Provider (v1.7)
 * ============================================
 * 创建时间：2026-06-27 23:45:00 +08:00
 * 创建依据：v1.7规范 - 使用alipay-sdk
 * 功能说明：
 *   - 创建支付宝支付会话
 *   - 验证webhook签名
 *   - 处理支付成功/失败事件
 * ============================================
 */

import AlipaySdk from 'alipay-sdk'
import {
  PaymentProvider,
  PaymentAction,
  PaymentSessionParams,
  WebhookEvent,
  PaymentResult
} from '../provider'

export class AlipayProvider implements PaymentProvider {
  readonly name = 'alipay' as const
  private sdk: AlipaySdk | null = null

  private getSdk(): AlipaySdk {
    if (!this.sdk) {
      if (!process.env.ALIPAY_APP_ID) {
        throw new Error('ALIPAY_APP_ID is not configured')
      }
      if (!process.env.ALIPAY_PRIVATE_KEY) {
        throw new Error('ALIPAY_PRIVATE_KEY is not configured')
      }
      if (!process.env.ALIPAY_PUBLIC_KEY) {
        throw new Error('ALIPAY_PUBLIC_KEY is not configured')
      }

      this.sdk = new AlipaySdk({
        appId: process.env.ALIPAY_APP_ID,
        privateKey: process.env.ALIPAY_PRIVATE_KEY,
        alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
        gateway: process.env.ALIPAY_GATEWAY_URL || 'https://openapi.alipay.com/gateway.do'
      })
    }
    return this.sdk
  }

  async createPaymentSession(params: PaymentSessionParams): Promise<PaymentAction> {
    const sdk = this.getSdk()

    // 使用SDK创建网页支付
    const result = await sdk.exec('alipay.trade.page.pay', {
      bizContent: {
        out_trade_no: params.orderId,
        total_amount: params.amount.toFixed(2),
        subject: `Order ${params.orderId}`,
        product_code: 'FAST_INSTANT_TRADE_PAY'
      },
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${params.locale}/payment/success`,
      notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/alipay`
    })

    // SDK返回的是支付URL
    return {
      type: 'redirect',
      url: result
    }
  }

  async verifyWebhook(
    params: any,
    signature: string
  ): Promise<WebhookEvent> {
    const sdk = this.getSdk()

    // 使用SDK验证签名
    const isValid = sdk.checkNotifySign(params)
    if (!isValid) {
      throw new Error('Alipay signature verification failed')
    }

    // 转换为统一格式
    const isSuccess = params.trade_status === 'TRADE_SUCCESS'

    return {
      type: isSuccess ? 'payment.success' : 'payment.failed',
      orderId: params.out_trade_no,
      transactionId: params.trade_no,
      amount: parseFloat(params.total_amount),
      currency: 'CNY',
      timestamp: new Date(params.gmt_payment),
      rawData: params
    }
  }

  async processPayment(event: WebhookEvent): Promise<PaymentResult> {
    return {
      success: event.type === 'payment.success',
      orderId: event.orderId,
      transactionId: event.transactionId
    }
  }
}
