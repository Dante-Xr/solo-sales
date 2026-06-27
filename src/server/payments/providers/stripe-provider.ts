/**
 * ============================================
 * Stripe Payment Provider
 * ============================================
 * 创建时间：2026-06-27 20:10:00 +08:00
 * 创建依据：v1.7规范 - Stripe支付提供商实现
 * 功能说明：
 *   - 创建Stripe Checkout Session
 *   - 验证Stripe webhook签名
 *   - 处理支付成功/失败事件
 * ============================================
 */

import Stripe from 'stripe'
import {
  PaymentProvider,
  PaymentAction,
  PaymentSessionParams,
  WebhookEvent,
  PaymentResult
} from '../provider'

export class StripeProvider implements PaymentProvider {
  readonly name = 'stripe' as const
  private stripe: Stripe | null = null

  private getStripe(): Stripe {
    if (!this.stripe) {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not configured')
      }

      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2026-02-25.clover'
      })
    }
    return this.stripe
  }

  async createPaymentSession(params: PaymentSessionParams): Promise<PaymentAction> {
    const stripe = this.getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: params.currency.toLowerCase(),
            unit_amount: Math.round(params.amount * 100), // Convert to cents
            product_data: {
              name: `Order ${params.orderId}`
            }
          },
          quantity: 1
        }
      ],
      metadata: {
        orderId: params.orderId,
        ...params.metadata
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${params.locale}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${params.locale}/payment/failure`
    })

    if (!session.url) {
      throw new Error('Stripe session URL not generated')
    }

    return {
      type: 'redirect',
      url: session.url
    }
  }

  async verifyWebhook(
    rawBody: string | Buffer,
    signature: string
  ): Promise<WebhookEvent> {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
    }

    const stripe = this.getStripe()
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    // Convert Stripe event to unified WebhookEvent format
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      return {
        type: 'payment.success',
        orderId: session.metadata?.orderId || '',
        transactionId: session.id,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency?.toUpperCase() || 'USD',
        timestamp: new Date(event.created * 1000),
        rawData: event
      }
    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session

      return {
        type: 'payment.cancelled',
        orderId: session.metadata?.orderId || '',
        transactionId: session.id,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency?.toUpperCase() || 'USD',
        timestamp: new Date(event.created * 1000),
        rawData: event
      }
    }

    throw new Error(`Unsupported Stripe event type: ${event.type}`)
  }

  async processPayment(event: WebhookEvent): Promise<PaymentResult> {
    // Basic validation
    if (!event.orderId || !event.transactionId) {
      throw new Error('Missing orderId or transactionId in webhook event')
    }

    return {
      success: event.type === 'payment.success',
      orderId: event.orderId,
      transactionId: event.transactionId,
      message: event.type === 'payment.success' ? 'Payment successful' : 'Payment failed'
    }
  }
}
