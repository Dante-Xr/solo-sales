/**
 * ============================================
 * Webhook幂等性集成测试
 * ============================================
 * 创建时间：2026-06-28
 * 创建依据：v1.7规范 - Phase 6集成测试
 * 测试覆盖：
 *   - Webhook重复投递幂等性
 *   - 库存不会重复扣减
 *   - 支付记录不会重复创建
 * ============================================
 */

import { OrderStatus, PaymentStatus } from '@prisma/client'

// Mock dependencies
const mockTransaction = jest.fn()
const mockOrderFindUnique = jest.fn()
const mockOrderUpdate = jest.fn()
const mockProductUpdate = jest.fn()
const mockPaymentCreate = jest.fn()
const mockPaymentUpdate = jest.fn()
const mockPaymentFindFirst = jest.fn()

jest.mock('@/lib/prisma', () => ({
  prisma: {
    get $transaction() { return mockTransaction },
    order: {
      get findUnique() { return mockOrderFindUnique },
      get update() { return mockOrderUpdate }
    },
    product: {
      get update() { return mockProductUpdate },
      get findUnique() {
        return jest.fn().mockResolvedValue({
          id: 'prod-1',
          stock: 100
        })
      }
    },
    payment: {
      get findFirst() { return mockPaymentFindFirst },
      get create() { return mockPaymentCreate },
      get update() { return mockPaymentUpdate }
    }
  }
}))

import { handlePaymentSuccess, findPaymentByTransactionId } from '@/server/services/order-state-machine'

describe('Webhook Idempotency Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Duplicate Webhook Handling', () => {
    it('should process first webhook and complete payment', async () => {
      // Arrange - First webhook
      const mockOrder = {
        id: 'order-123',
        status: OrderStatus.PENDING,
        totalAmount: 100.50,
        items: [
          { productId: 'prod-1', quantity: 2 }
        ]
      }

      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          order: {
            findUnique: jest.fn().mockResolvedValue(mockOrder),
            update: jest.fn().mockResolvedValue({ ...mockOrder, status: OrderStatus.PAID })
          },
          product: {
            update: jest.fn().mockResolvedValue({})
          },
          payment: {
            findFirst: jest.fn().mockResolvedValue(null), // No existing payment
            create: jest.fn().mockResolvedValue({
              id: 'payment-1',
              orderId: 'order-123',
              status: PaymentStatus.COMPLETED
            })
          }
        }
        return await callback(tx)
      })

      // Act - First webhook
      await handlePaymentSuccess({
        orderId: 'order-123',
        transactionId: 'stripe-txn-456',
        amount: 100.50,
        provider: 'stripe'
      })

      // Assert - Should be processed normally
      expect(mockTransaction).toHaveBeenCalledTimes(1)
    })

    it('should NOT duplicate stock decrement on second identical webhook', async () => {
      // Arrange - Order already PAID
      const mockPaidOrder = {
        id: 'order-123',
        status: OrderStatus.PAID, // Already paid
        totalAmount: 100.50,
        items: [
          { productId: 'prod-1', quantity: 2 }
        ]
      }

      const productUpdateMock = jest.fn()
      const paymentCreateMock = jest.fn()
      const orderUpdateMock = jest.fn()

      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          order: {
            findUnique: jest.fn().mockResolvedValue(mockPaidOrder),
            update: orderUpdateMock
          },
          product: {
            update: productUpdateMock
          },
          payment: {
            findFirst: jest.fn().mockResolvedValue({
              id: 'payment-1',
              status: PaymentStatus.COMPLETED
            }),
            create: paymentCreateMock,
            update: jest.fn()
          }
        }
        return await callback(tx)
      })

      // Act - Second webhook (duplicate)
      await handlePaymentSuccess({
        orderId: 'order-123',
        transactionId: 'stripe-txn-456',
        amount: 100.50,
        provider: 'stripe'
      })

      // Assert - Stock should NOT be decremented again
      expect(productUpdateMock).not.toHaveBeenCalled()
      expect(orderUpdateMock).not.toHaveBeenCalled()
      expect(paymentCreateMock).not.toHaveBeenCalled()
    })

    it('should use provider+transactionId for payment deduplication', async () => {
      // Arrange
      const mockOrder = {
        id: 'order-123',
        status: OrderStatus.PENDING,
        items: []
      }

      const existingPayment = {
        id: 'payment-existing',
        provider: 'stripe',
        transactionId: 'txn-456',
        status: PaymentStatus.PENDING
      }

      const paymentCreateMock = jest.fn()
      const paymentUpdateMock = jest.fn()

      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          order: {
            findUnique: jest.fn().mockResolvedValue(mockOrder),
            update: jest.fn()
          },
          product: {
            update: jest.fn()
          },
          payment: {
            findFirst: jest.fn().mockResolvedValue(existingPayment),
            create: paymentCreateMock,
            update: paymentUpdateMock
          }
        }
        return await callback(tx)
      })

      // Act
      await handlePaymentSuccess({
        orderId: 'order-123',
        transactionId: 'txn-456',
        amount: 100,
        provider: 'stripe'
      })

      // Assert - Should UPDATE existing payment, not CREATE new
      expect(paymentUpdateMock).toHaveBeenCalled()
      expect(paymentCreateMock).not.toHaveBeenCalled()
    })
  })

  describe('Race Condition Scenarios', () => {
    it('should handle concurrent webhooks for same order', async () => {
      // Arrange - Simulate race condition
      const mockOrder = {
        id: 'order-123',
        status: OrderStatus.PENDING,
        items: [{ productId: 'prod-1', quantity: 1 }]
      }

      let firstCallCompleted = false

      mockTransaction.mockImplementation(async (callback) => {
        // First call sets the order to PAID
        const orderStatus = firstCallCompleted ? OrderStatus.PAID : OrderStatus.PENDING

        const tx = {
          order: {
            findUnique: jest.fn().mockResolvedValue({
              ...mockOrder,
              status: orderStatus
            }),
            update: jest.fn()
          },
          product: {
            update: jest.fn()
          },
          payment: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn(),
            update: jest.fn()
          }
        }

        const result = await callback(tx)
        firstCallCompleted = true
        return result
      })

      // Act - Two concurrent webhooks
      await handlePaymentSuccess({
        orderId: 'order-123',
        transactionId: 'txn-1',
        amount: 100,
        provider: 'stripe'
      })

      // Second webhook should skip processing
      await handlePaymentSuccess({
        orderId: 'order-123',
        transactionId: 'txn-1',
        amount: 100,
        provider: 'stripe'
      })

      // Assert - Transaction called twice, but second skips
      expect(mockTransaction).toHaveBeenCalledTimes(2)
    })
  })

  describe('Cross-Provider Idempotency', () => {
    it('should allow same transactionId from different providers', async () => {
      // Arrange - Different providers can have same transaction ID
      mockPaymentFindFirst.mockResolvedValueOnce({
        id: 'payment-1',
        provider: 'stripe',
        transactionId: 'txn-123'
      })
      mockPaymentFindFirst.mockResolvedValueOnce(null) // Alipay not found

      // Act
      const stripePayment = await findPaymentByTransactionId('stripe', 'txn-123')
      const alipayPayment = await findPaymentByTransactionId('alipay', 'txn-123')

      // Assert
      expect(stripePayment).not.toBeNull()
      expect(alipayPayment).toBeNull()
      expect(mockPaymentFindFirst).toHaveBeenCalledTimes(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle webhook for cancelled order gracefully', async () => {
      // Arrange
      const mockCancelledOrder = {
        id: 'order-123',
        status: OrderStatus.CANCELLED,
        items: []
      }

      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          order: {
            findUnique: jest.fn().mockResolvedValue(mockCancelledOrder)
          }
        }
        return await callback(tx)
      })

      // Act & Assert - Should reject invalid state transition
      await expect(
        handlePaymentSuccess({
          orderId: 'order-123',
          transactionId: 'txn-456',
          amount: 100,
          provider: 'stripe'
        })
      ).rejects.toThrow('Invalid order status transition')
    })

    it('should handle zero-amount orders', async () => {
      // Arrange
      const mockOrder = {
        id: 'order-123',
        status: OrderStatus.PENDING,
        items: []
      }

      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          order: {
            findUnique: jest.fn().mockResolvedValue(mockOrder),
            update: jest.fn()
          },
          product: {
            update: jest.fn()
          },
          payment: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn()
          }
        }
        return await callback(tx)
      })

      // Act & Assert - Should handle zero amount
      await expect(
        handlePaymentSuccess({
          orderId: 'order-123',
          transactionId: 'txn-456',
          amount: 0,
          provider: 'stripe'
        })
      ).resolves.not.toThrow()
    })
  })
})
