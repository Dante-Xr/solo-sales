/**
 * ============================================
 * Alipay Payment Provider (Skeleton)
 * ============================================
 * 创建时间：2026-06-27 20:15:00 +08:00
 * 创建依据：v1.7规范 - Alipay提供商骨架
 * 功能说明：
 *   - Phase 4将使用alipay-sdk实现
 *   - 当前为骨架，抛出未实现错误
 * ============================================
 */

import {
  PaymentProvider,
  PaymentAction,
  PaymentSessionParams,
  WebhookEvent,
  PaymentResult
} from '../provider'

export class AlipayProvider implements PaymentProvider {
  readonly name = 'alipay' as const

  async createPaymentSession(params: PaymentSessionParams): Promise<PaymentAction> {
    throw new Error('Alipay payment not implemented yet (Phase 4)')
  }

  async verifyWebhook(
    rawBody: string | Buffer,
    signature: string
  ): Promise<WebhookEvent> {
    throw new Error('Alipay webhook verification not implemented yet (Phase 4)')
  }

  async processPayment(event: WebhookEvent): Promise<PaymentResult> {
    throw new Error('Alipay payment processing not implemented yet (Phase 4)')
  }
}
