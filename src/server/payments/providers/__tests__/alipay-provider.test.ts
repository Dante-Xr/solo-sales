/**
 * ============================================
 * AlipayProvider 测试
 * ============================================
 * 创建时间：2026-06-27 23:40:00 +08:00
 * 创建依据：v1.7规范 - TDD方法
 * 测试覆盖：
 *   - createPaymentSession: 创建支付会话
 *   - verifyWebhook: 验证webhook签名
 *   - processPayment: 处理支付事件
 * ============================================
 */

// Mock alipay-sdk before imports
const mockExec = jest.fn()
const mockCheckNotifySign = jest.fn()

jest.mock('alipay-sdk', () => {
  return {
    AlipaySdk: jest.fn().mockImplementation(() => ({
      exec: mockExec,
      checkNotifySign: mockCheckNotifySign,
    })),
  }
})

import { AlipayProvider } from '../alipay-provider'

describe('AlipayProvider', () => {
  let provider: AlipayProvider

  beforeEach(() => {
    // Set required environment variables
    process.env.ALIPAY_APP_ID = 'test_app_id'
    process.env.ALIPAY_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\ntest_key\n-----END RSA PRIVATE KEY-----'
    process.env.ALIPAY_PUBLIC_KEY = '-----BEGIN PUBLIC KEY-----\ntest_public_key\n-----END PUBLIC KEY-----'

    provider = new AlipayProvider()
    jest.clearAllMocks()
  })

  describe('createPaymentSession', () => {
    it('should create payment URL for web payment', async () => {
      // Arrange
      const mockPaymentUrl = 'https://openapi.alipay.com/gateway.do?...'
      mockExec.mockResolvedValue(mockPaymentUrl)

      // Act
      const result = await provider.createPaymentSession({
        orderId: 'order-123',
        amount: 100.50,
        currency: 'CNY',
        locale: 'zh'
      })

      // Assert
      expect(result.type).toBe('redirect')
      if (result.type === 'redirect') {
        expect(result.url).toBe(mockPaymentUrl)
      }
      expect(mockExec).toHaveBeenCalledWith(
        'alipay.trade.page.pay',
        expect.objectContaining({
          bizContent: expect.objectContaining({
            out_trade_no: 'order-123',
            total_amount: '100.50'
          })
        })
      )
    })

    it('should include success and notify URLs', async () => {
      // Arrange
      mockExec.mockResolvedValue('https://payment.url')

      // Act
      await provider.createPaymentSession({
        orderId: 'order-123',
        amount: 50,
        currency: 'CNY',
        locale: 'zh'
      })

      // Assert
      expect(mockExec).toHaveBeenCalledWith(
        'alipay.trade.page.pay',
        expect.objectContaining({
          returnUrl: expect.stringContaining('/payment/success'),
          notifyUrl: expect.stringContaining('/api/webhooks/alipay')
        })
      )
    })
  })

  describe('verifyWebhook', () => {
    it('should verify valid webhook signature', async () => {
      // Arrange
      const webhookParams = {
        out_trade_no: 'order-123',
        trade_no: 'alipay-txn-456',
        trade_status: 'TRADE_SUCCESS',
        total_amount: '100.50',
        gmt_payment: '2026-06-27 23:40:00'
      }
      mockCheckNotifySign.mockReturnValue(true)

      // Act
      const result = await provider.verifyWebhook(JSON.stringify(webhookParams), 'signature')

      // Assert
      expect(result.type).toBe('payment.success')
      expect(result.orderId).toBe('order-123')
      expect(result.transactionId).toBe('alipay-txn-456')
      expect(result.amount).toBe(100.50)
    })

    it('should throw error for invalid signature', async () => {
      // Arrange
      mockCheckNotifySign.mockReturnValue(false)

      // Act & Assert
      await expect(
        provider.verifyWebhook(JSON.stringify({ out_trade_no: 'order-123' }), 'bad-signature')
      ).rejects.toThrow('Alipay signature verification failed')
    })

    it('should handle failed trade status', async () => {
      // Arrange
      const webhookParams = {
        out_trade_no: 'order-123',
        trade_no: 'alipay-txn-456',
        trade_status: 'TRADE_CLOSED',
        total_amount: '50.00',
        gmt_payment: '2026-06-27 23:40:00'
      }
      mockCheckNotifySign.mockReturnValue(true)

      // Act
      const result = await provider.verifyWebhook(JSON.stringify(webhookParams), 'signature')

      // Assert
      expect(result.type).toBe('payment.failed')
    })
  })

  describe('processPayment', () => {
    it('should process successful payment', async () => {
      // Arrange
      const event = {
        type: 'payment.success' as const,
        orderId: 'order-123',
        transactionId: 'alipay-txn-456',
        amount: 100,
        currency: 'CNY',
        timestamp: new Date(),
        rawData: {}
      }

      // Act
      const result = await provider.processPayment(event)

      // Assert
      expect(result.success).toBe(true)
      expect(result.orderId).toBe('order-123')
      expect(result.transactionId).toBe('alipay-txn-456')
    })
  })
})
