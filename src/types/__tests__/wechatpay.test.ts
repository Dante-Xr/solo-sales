/**
 * WeChat Pay SDK 类型定义测试
 * 验证类型定义与实际 SDK API 行为一致
 */

import type { Wechatpay, WechatpayConfig, NativePayRequest, NativePayResponse } from '../wechatpay'

describe('WeChat Pay SDK Types', () => {
  test('WechatpayConfig should have required fields', () => {
    const config: WechatpayConfig = {
      mchid: 'test_merchant_id',
      serial: 'test_serial_number',
      privateKey: 'test_private_key',
      apiv3Key: 'test_apiv3_key'
    }

    expect(config.mchid).toBeDefined()
    expect(config.serial).toBeDefined()
    expect(config.privateKey).toBeDefined()
    expect(config.apiv3Key).toBeDefined()
  })

  test('NativePayRequest should accept transaction fields', () => {
    const request: NativePayRequest = {
      appid: 'test_app_id',
      mchid: 'test_merchant_id',
      out_trade_no: 'ORDER_123',
      description: 'Test Order',
      notify_url: 'https://example.com/webhook',
      amount: {
        total: 9999,
        currency: 'CNY'
      }
    }

    expect(request.out_trade_no).toBe('ORDER_123')
    expect(request.amount.total).toBe(9999)
    expect(request.amount.currency).toBe('CNY')
  })

  test('NativePayResponse should have code_url', () => {
    const response: NativePayResponse = {
      code_url: 'weixin://wxpay/bizpayurl?pr=test123'
    }

    expect(response.code_url).toBeDefined()
    expect(response.code_url).toContain('weixin://')
  })

  test('Wechatpay should have v3.pay.transactions.native method', () => {
    // 类型检查：确保 SDK 接口定义正确
    const mockClient: Pick<Wechatpay, 'v3'> = {
      v3: {
        pay: {
          transactions: {
            native: async (_params: NativePayRequest): Promise<{ data: NativePayResponse }> => {
              return {
                data: {
                  code_url: 'weixin://wxpay/bizpayurl?pr=test123'
                }
              }
            }
          }
        }
      }
    }

    expect(typeof mockClient.v3.pay.transactions.native).toBe('function')
  })
})
