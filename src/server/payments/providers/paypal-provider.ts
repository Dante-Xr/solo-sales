/**
 * ============================================
 * PayPal Payment Provider (Disabled)
 * ============================================
 * 创建时间：2026-06-27 20:15:00 +08:00
 * 创建依据：v1.7规范 - 决策4保留PayPal但禁用
 * 功能说明：
 *   - 保留代码用于后期接入
 *   - 通过环境变量控制是否启用
 * ============================================
 */

import {
  PaymentProvider,
  PaymentAction,
  PaymentSessionParams,
  WebhookEvent,
  PaymentResult
} from '../provider'

export class PayPalProvider implements PaymentProvider {
  readonly name = 'paypal' as const

  async createPaymentSession(params: PaymentSessionParams): Promise<PaymentAction> {
    throw new Error('PayPal payment not enabled (v1.7). Enable via ENABLED_PAYMENT_PROVIDERS env var')
  }

  async verifyWebhook(
    rawBody: string | Buffer,
    signature: string
  ): Promise<WebhookEvent> {
    throw new Error('PayPal webhook verification not enabled (v1.7)')
  }

  async processPayment(event: WebhookEvent): Promise<PaymentResult> {
    throw new Error('PayPal payment processing not enabled (v1.7)')
  }
}
