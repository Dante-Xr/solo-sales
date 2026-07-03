/**
 * Alipay SDK 类型定义测试
 * 验证类型定义与实际 SDK API 行为一致
 */

import type { AlipaySdk, AlipaySdkConfig, AlipayExecParams, AlipayNotifyParams } from '../alipay-sdk'

describe('Alipay SDK Types', () => {
  test('AlipaySdkConfig should have required fields', () => {
    const config: AlipaySdkConfig = {
      appId: 'test_app_id',
      privateKey: 'test_private_key',
      alipayPublicKey: 'test_public_key',
      gateway: 'https://openapi.alipay.com/gateway.do'
    }

    expect(config.appId).toBeDefined()
    expect(config.privateKey).toBeDefined()
    expect(config.alipayPublicKey).toBeDefined()
  })

  test('AlipayExecParams should accept bizContent with trade fields', () => {
    const params: AlipayExecParams = {
      bizContent: {
        out_trade_no: 'ORDER_123',
        total_amount: '99.99',
        subject: 'Test Order',
        product_code: 'FAST_INSTANT_TRADE_PAY'
      },
      returnUrl: 'https://example.com/return',
      notifyUrl: 'https://example.com/notify'
    }

    expect(params.bizContent.out_trade_no).toBe('ORDER_123')
    expect(params.bizContent.total_amount).toBe('99.99')
  })

  test('AlipayNotifyParams should have trade status fields', () => {
    const notify: AlipayNotifyParams = {
      trade_status: 'TRADE_SUCCESS',
      out_trade_no: 'ORDER_123',
      trade_no: 'ALIPAY_TRANSACTION_123',
      total_amount: '99.99',
      gmt_payment: '2026-07-03 10:00:00'
    }

    expect(notify.trade_status).toBe('TRADE_SUCCESS')
    expect(notify.trade_no).toBeDefined()
  })

  test('AlipaySdk should have exec and checkNotifySign methods', () => {
    // 类型检查：确保 SDK 接口定义正确
    const mockSdk: Pick<AlipaySdk, 'exec' | 'checkNotifySign'> = {
      exec: async (_method: string, _params: AlipayExecParams): Promise<string> => {
        return 'https://payment.url'
      },
      checkNotifySign: (_params: AlipayNotifyParams): boolean => {
        return true
      }
    }

    expect(typeof mockSdk.exec).toBe('function')
    expect(typeof mockSdk.checkNotifySign).toBe('function')
  })
})
