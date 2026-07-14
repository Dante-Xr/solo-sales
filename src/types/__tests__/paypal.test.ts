/**
 * PayPal SDK 类型定义测试
 * 验证类型定义与实际 SDK API 行为一致
 */

import type {
  PayPalHttpClient,
  PayPalOrderRequest,
  PayPalOrderResponse,
  PayPalLink,
  PayPalCaptureRequest,
  PayPalAmount,
  PayPalPurchaseUnit
} from '../paypal'

describe('PayPal SDK Types', () => {
  test('PayPalOrderRequest should accept purchase_units and application_context', () => {
    const orderBody: PayPalOrderRequest = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: 'ORDER_123',
          amount: {
            currency_code: 'USD',
            value: '99.99'
          },
          description: 'Test Order',
          custom_id: 'ORDER_123'
        }
      ],
      application_context: {
        brand_name: 'Test Store',
        locale: 'en_US',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel'
      }
    }

    expect(orderBody.intent).toBe('CAPTURE')
    expect(orderBody.purchase_units[0].reference_id).toBe('ORDER_123')
    expect(orderBody.application_context?.return_url).toBe('https://example.com/success')
  })

  test('PayPalOrderResponse should have links array with typed elements', () => {
    const response: PayPalOrderResponse = {
      id: 'ORDER_ID_123',
      status: 'CREATED',
      links: [
        {
          rel: 'approve',
          href: 'https://paypal.com/approve?token=abc123',
          method: 'GET'
        },
        {
          rel: 'self',
          href: 'https://api.paypal.com/v2/checkout/orders/ORDER_ID_123',
          method: 'GET'
        }
      ]
    }

    const approveLink = response.links?.find((link: PayPalLink) => link.rel === 'approve')
    expect(approveLink?.href).toContain('paypal.com')
    expect(approveLink?.method).toBe('GET')
  })

  test('PayPalCaptureRequest should accept empty body', () => {
    const captureBody: PayPalCaptureRequest = {}

    expect(captureBody).toBeDefined()
  })

  test('PayPalAmount should have currency_code and value', () => {
    const amount: PayPalAmount = {
      currency_code: 'USD',
      value: '99.99'
    }

    expect(amount.currency_code).toBe('USD')
    expect(amount.value).toBe('99.99')
  })

  test('PayPalPurchaseUnit should have all required fields', () => {
    const unit: PayPalPurchaseUnit = {
      reference_id: 'ORDER_123',
      amount: {
        currency_code: 'USD',
        value: '99.99'
      },
      description: 'Test Order',
      custom_id: 'ORDER_123'
    }

    expect(unit.reference_id).toBe('ORDER_123')
    expect(unit.custom_id).toBe('ORDER_123')
  })

  test('PayPalHttpClient.execute should return typed response', async () => {
    // 类型检查：确保 execute 方法返回正确类型
    const mockClient: Pick<PayPalHttpClient, 'execute'> = {
      execute: async <T>(_request: unknown): Promise<{ result: T }> => {
        return {
          result: {
            id: 'ORDER_ID',
            status: 'CREATED',
            links: []
          } as T
        }
      }
    }

    const response = await mockClient.execute<PayPalOrderResponse>({})
    expect(response.result.id).toBe('ORDER_ID')
  })
})
