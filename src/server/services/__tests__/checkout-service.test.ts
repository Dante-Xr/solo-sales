/**
 * ============================================
 * CheckoutService 测试
 * ============================================
 * 创建时间：2026-06-27 21:10:00 +08:00
 * 创建依据：v1.7规范 - TDD方法
 * 测试覆盖：
 *   - 金额计算
 *   - 库存验证
 * ============================================
 */

// Mock functions must be defined before jest.mock
const mockFindMany = jest.fn()
const mockFindUnique = jest.fn()

jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      get findMany() { return mockFindMany },
      get findUnique() { return mockFindUnique }
    }
  }
}))

jest.mock('../order-service')
jest.mock('../../payments/factory')

import { CheckoutService } from '../checkout-service'

describe('CheckoutService', () => {
  let checkoutService: CheckoutService

  beforeEach(() => {
    checkoutService = new CheckoutService()
    jest.clearAllMocks()
  })

  describe('calculateOrderAmount', () => {
    it('should calculate subtotal correctly', async () => {
      // Arrange
      const mockProducts = [
        { id: 'prod-1', name: 'Product 1', price: 10.00 },
        { id: 'prod-2', name: 'Product 2', price: 25.50 }
      ]

      mockFindMany.mockResolvedValue(mockProducts)

      // Act
      const result = await checkoutService.calculateOrderAmount({
        items: [
          { productId: 'prod-1', quantity: 2 },
          { productId: 'prod-2', quantity: 1 }
        ]
      })

      // Assert
      expect(result.subtotal).toBe(45.50) // 10*2 + 25.50*1
    })

    it('should apply free shipping for orders >= $50', async () => {
      // Arrange
      const mockProducts = [
        { id: 'prod-1', name: 'Product 1', price: 60.00 }
      ]

      mockFindMany.mockResolvedValue(mockProducts)

      // Act
      const result = await checkoutService.calculateOrderAmount({
        items: [{ productId: 'prod-1', quantity: 1 }]
      })

      // Assert
      expect(result.shippingFee).toBe(0)
      expect(result.totalAmount).toBe(60.00)
    })

    it('should charge $5.99 shipping for orders < $50', async () => {
      // Arrange
      const mockProducts = [
        { id: 'prod-1', name: 'Product 1', price: 30.00 }
      ]

      mockFindMany.mockResolvedValue(mockProducts)

      // Act
      const result = await checkoutService.calculateOrderAmount({
        items: [{ productId: 'prod-1', quantity: 1 }]
      })

      // Assert
      expect(result.shippingFee).toBe(5.99)
      expect(result.totalAmount).toBe(35.99) // 30 + 5.99
    })

    it('should throw error if product not found', async () => {
      // Arrange
      mockFindMany.mockResolvedValue([])

      // Act & Assert
      await expect(
        checkoutService.calculateOrderAmount({
          items: [{ productId: 'nonexistent', quantity: 1 }]
        })
      ).rejects.toThrow('Some products not found')
    })
  })

  describe('validateInventory', () => {
    it('should pass when stock is sufficient', async () => {
      // Arrange
      const mockProduct = { id: 'prod-1', name: 'Product 1', stock: 10 }
      mockFindUnique.mockResolvedValue(mockProduct)

      // Act & Assert
      await expect(
        checkoutService.validateInventory([
          { productId: 'prod-1', quantity: 5 }
        ])
      ).resolves.not.toThrow()
    })

    it('should throw error when stock is insufficient', async () => {
      // Arrange
      const mockProduct = { id: 'prod-1', name: 'Product 1', stock: 3 }
      mockFindUnique.mockResolvedValue(mockProduct)

      // Act & Assert
      await expect(
        checkoutService.validateInventory([
          { productId: 'prod-1', quantity: 5 }
        ])
      ).rejects.toThrow('Insufficient stock for Product 1')
    })

    it('should throw error when product not found', async () => {
      // Arrange
      mockFindUnique.mockResolvedValue(null)

      // Act & Assert
      await expect(
        checkoutService.validateInventory([
          { productId: 'nonexistent', quantity: 1 }
        ])
      ).rejects.toThrow('Product nonexistent not found')
    })
  })
})

