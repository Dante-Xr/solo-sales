/**
 * ============================================
 * WeChatPayProvider 测试
 * ============================================
 * 创建时间：2026-06-28 00:10:00 +08:00
 * 创建依据：v1.7规范 - TDD方法
 * 测试覆盖：
 *   - createPaymentSession: 创建Native支付二维码
 *   - verifyWebhook: 验证webhook签名和解密
 *   - processPayment: 处理支付事件
 * ============================================
 */

// Mock wechatpay-axios-plugin before imports
const mockPost = jest.fn()

jest.mock('wechatpay-axios-plugin', () => ({
  Wechatpay: jest.fn().mockImplementation(() => ({
    v3: {
      pay: {
        transactions: {
          native: mockPost
        }
      }
    }
  }))
}))

import { WeChatPayProvider } from '../wechatpay-provider'

describe('WeChatPayProvider', () => {
  let provider: WeChatPayProvider

  beforeEach(() => {
    // Set required environment variables
    process.env.WECHATPAY_MCHID = 'test_mchid'
    process.env.WECHATPAY_SERIAL_NO = 'test_serial'
    process.env.WECHATPAY_APIV3_KEY = 'test_apiv3_key_32_characters_'
    process.env.WECHATPAY_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest_key\n-----END PRIVATE KEY-----'

    provider = new WeChatPayProvider()
    jest.clearAllMocks()
  })

  describe('createPaymentSession', () => {
    it('should create QR code data for Native payment', async () => {
      // Arrange
      const mockResponse = {
        data: {
          code_url: 'weixin://wxpay/bizpayurl?pr=test_code'
        }
      }
      mockPost.mockResolvedValue(mockResponse)

      // Act
      const result = await provider.createPaymentSession({
        orderId: 'order-123',
        amount: 100.50,
        currency: 'CNY',
        locale: 'zh'
      })

      // Assert
      expect(result.type).toBe('qrcode')
      expect(result.data).toBe('weixin://wxpay/bizpayurl?pr=test_code')
      expect(result.expiry).toBeInstanceOf(Date)
    })

    it('should include correct payment parameters', async () => {
      // Arrange
      mockPost.mockResolvedValue({
        data: { code_url: 'weixin://test' }
      })

      // Act
      await provider.createPaymentSession({
        orderId: 'order-123',
        amount: 50.00,
        currency: 'CNY',
        locale: 'zh'
      })

      // Assert
      expect(mockPost).toHaveBeenCalledWith(
        expect.objectContaining({
          out_trade_no: 'order-123',
          amount: {
            total: 5000, // 50.00 * 100 in cents
            currency: 'CNY'
          }
        })
      )
    })
  })

  describe('verifyWebhook', () => {
    it('should verify and decrypt valid webhook', async () => {
      // Arrange
      const encryptedData = JSON.stringify({
        resource: {
          ciphertext: 'encrypted_payment_data',
          nonce: 'test_nonce',
          associated_data: 'test_data'
        }
      })

      // Mock decryption result
      const decryptedData = {
        out_trade_no: 'order-123',
        transaction_id: 'wx-txn-456',
        trade_state: 'SUCCESS',
        amount: {
          total: 10050, // 100.50 yuan in cents
          currency: 'CNY'
        },
        success_time: '2026-06-28T00:10:00+08:00'
      }

      // Mock the decryption (simplified for test)
      jest.spyOn(provider as any, 'decryptResource').mockResolvedValue(decryptedData)

      // Act
      const result = await provider.verifyWebhook(encryptedData, 'signature')

      // Assert
      expect(result.type).toBe('payment.success')
      expect(result.orderId).toBe('order-123')
      expect(result.transactionId).toBe('wx-txn-456')
      expect(result.amount).toBe(100.50)
      expect(result.currency).toBe('CNY')
    })

    it('should handle failed payment status', async () => {
      // Arrange
      const encryptedData = JSON.stringify({
        resource: { ciphertext: 'data', nonce: 'nonce', associated_data: 'ad' }
      })

      const decryptedData = {
        out_trade_no: 'order-123',
        transaction_id: 'wx-txn-456',
        trade_state: 'CLOSED',
        amount: { total: 5000, currency: 'CNY' },
        success_time: '2026-06-28T00:10:00+08:00'
      }

      jest.spyOn(provider as any, 'decryptResource').mockResolvedValue(decryptedData)

      // Act
      const result = await provider.verifyWebhook(encryptedData, 'signature')

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
        transactionId: 'wx-txn-456',
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
      expect(result.transactionId).toBe('wx-txn-456')
    })
  })
})
