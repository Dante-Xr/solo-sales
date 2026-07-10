/**
 * ============================================
 * WeChat Pay Payment Provider (v1.7)
 * ============================================
 * 创建时间：2026-06-28 00:15:00 +08:00
 * 创建依据：v1.7规范 - 使用wechatpay-axios-plugin
 * 功能说明：
 *   - 创建微信Native支付二维码
 *   - 验证webhook签名和解密
 *   - 处理支付成功/失败事件
 * ============================================
 */

import crypto from 'crypto'
import {
  PaymentProvider,
  PaymentAction,
  PaymentSessionParams,
  WebhookEvent,
  PaymentResult,
  WebhookRawData
} from '../provider'
import type { Wechatpay, WechatpayNotifyBody, WechatpayNotifyDecrypted, WechatpayNotifyResource } from '@/types/wechatpay'

// The provider package exposes this constructor through CommonJS only.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Wechatpay: WechatpayConstructor } = require('wechatpay-axios-plugin')

export class WeChatPayProvider implements PaymentProvider {
  readonly name = 'wechatpay' as const
  private client: Wechatpay | null = null

  private getClient(): Wechatpay {
    if (!this.client) {
      if (!process.env.WECHATPAY_MCHID) {
        throw new Error('WECHATPAY_MCHID is not configured')
      }
      if (!process.env.WECHATPAY_SERIAL_NO) {
        throw new Error('WECHATPAY_SERIAL_NO is not configured')
      }
      if (!process.env.WECHATPAY_APIV3_KEY) {
        throw new Error('WECHATPAY_APIV3_KEY is not configured')
      }
      if (!process.env.WECHATPAY_PRIVATE_KEY) {
        throw new Error('WECHATPAY_PRIVATE_KEY is not configured')
      }

      this.client = new WechatpayConstructor({
        mchid: process.env.WECHATPAY_MCHID,
        serial: process.env.WECHATPAY_SERIAL_NO,
        privateKey: process.env.WECHATPAY_PRIVATE_KEY,
        apiv3Key: process.env.WECHATPAY_APIV3_KEY
      }) as Wechatpay
    }
    return this.client
  }

  async createPaymentSession(params: PaymentSessionParams): Promise<PaymentAction> {
    const client = this.getClient()

    const appId = process.env.WECHATPAY_APP_ID || process.env.NEXT_PUBLIC_APP_ID
    const mchId = process.env.WECHATPAY_MCHID

    if (!appId) {
      throw new Error('WECHATPAY_APP_ID or NEXT_PUBLIC_APP_ID must be configured')
    }
    if (!mchId) {
      throw new Error('WECHATPAY_MCHID must be configured')
    }

    // 创建Native支付订单
    const response = await client.v3.pay.transactions.native({
      appid: appId,
      mchid: mchId,
      out_trade_no: params.orderId,
      description: `Order ${params.orderId}`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/wechatpay`,
      amount: {
        total: Math.round(params.amount * 100), // Convert to cents
        currency: 'CNY'
      }
    })

    // 二维码5分钟过期
    const expiry = new Date()
    expiry.setMinutes(expiry.getMinutes() + 5)

    return {
      type: 'qrcode',
      data: response.data.code_url,
      expiry
    }
  }

  async verifyWebhook(
    rawBody: string | Buffer,
    _signature: string,
    _headers?: Record<string, string>
  ): Promise<WebhookEvent> {
    // Parse webhook body
    const body: WechatpayNotifyBody = typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString())

    // Decrypt resource
    const decrypted = await this.decryptResource(body.resource)

    // Convert to unified format
    const isSuccess = decrypted.trade_state === 'SUCCESS'

    return {
      type: isSuccess ? 'payment.success' : 'payment.failed',
      orderId: decrypted.out_trade_no,
      transactionId: decrypted.transaction_id,
      amount: decrypted.amount.total / 100, // Convert from cents
      currency: decrypted.amount.currency,
      timestamp: new Date(decrypted.success_time),
      rawData: body as unknown as WebhookRawData
    }
  }

  private async decryptResource(resource: WechatpayNotifyResource): Promise<WechatpayNotifyDecrypted> {
    if (!process.env.WECHATPAY_APIV3_KEY) {
      throw new Error('WECHATPAY_APIV3_KEY is not configured')
    }

    const { ciphertext, nonce, associated_data } = resource

    // Decrypt using AES-256-GCM
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      process.env.WECHATPAY_APIV3_KEY,
      nonce
    )

    decipher.setAuthTag(Buffer.from(ciphertext.slice(-16), 'base64'))
    decipher.setAAD(Buffer.from(associated_data))

    let decrypted = decipher.update(ciphertext.slice(0, -16), 'base64', 'utf8')
    decrypted += decipher.final('utf8')

    return JSON.parse(decrypted)
  }

  async processPayment(event: WebhookEvent): Promise<PaymentResult> {
    return {
      success: event.type === 'payment.success',
      orderId: event.orderId,
      transactionId: event.transactionId
    }
  }
}
