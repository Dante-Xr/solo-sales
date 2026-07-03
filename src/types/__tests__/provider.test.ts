/**
 * Payment Provider 核心接口类型测试
 * 验证 WebhookEvent.rawData 类型定义
 */

import type { WebhookEvent, WebhookRawData } from '@/server/payments/provider'

describe('Payment Provider Types', () => {
  test('WebhookEvent should have typed rawData', () => {
    const event: WebhookEvent = {
      type: 'payment.success',
      orderId: 'ORDER_123',
      transactionId: 'TXN_123',
      amount: 99.99,
      currency: 'USD',
      timestamp: new Date(),
      rawData: {
        provider: 'stripe',
        eventId: 'evt_123',
        data: {
          object: {
            id: 'ch_123',
            amount: 9999
          }
        }
      }
    }

    expect(event.rawData.provider).toBeDefined()
    expect(event.rawData.eventId).toBeDefined()
  })

  test('WebhookRawData should accept different provider data', () => {
    // Stripe raw data
    const stripeData: WebhookRawData = {
      provider: 'stripe',
      eventId: 'evt_123',
      data: {
        object: { id: 'ch_123' }
      }
    }

    // Alipay raw data
    const alipayData: WebhookRawData = {
      provider: 'alipay',
      trade_no: 'ALIPAY_TXN_123',
      trade_status: 'TRADE_SUCCESS'
    }

    // WeChat Pay raw data
    const wechatData: WebhookRawData = {
      provider: 'wechatpay',
      id: 'WECHAT_NOTIFY_123',
      event_type: 'TRANSACTION.SUCCESS'
    }

    // PayPal raw data
    const paypalData: WebhookRawData = {
      provider: 'paypal',
      event_type: 'PAYMENT.CAPTURE.COMPLETED',
      resource: { id: 'PAYPAL_CAPTURE_123' }
    }

    expect(stripeData.provider).toBe('stripe')
    expect(alipayData.provider).toBe('alipay')
    expect(wechatData.provider).toBe('wechatpay')
    expect(paypalData.provider).toBe('paypal')
  })

  test('WebhookRawData should allow optional fields', () => {
    const minimalData: WebhookRawData = {
      provider: 'stripe'
    }

    expect(minimalData.provider).toBe('stripe')
  })
})
