/**
 * BundleService 类型定义测试
 * 验证 Prisma Payload 类型别名使用正确
 */

import { Prisma } from '@prisma/client'
import type { BundleWithItems, BundleItemWithProduct } from '../bundle/types'

describe('BundleService Types', () => {
  test('BundleWithItems should include nested items with products', () => {
    const bundle: BundleWithItems = {
      id: 'bundle_1',
      name: 'Test Bundle',
      description: 'Test Description',
      slug: 'test-bundle',
      status: 'ACTIVE',
      discountType: 'PERCENTAGE',
      discountValue: new Prisma.Decimal('10'),
      startDate: null,
      endDate: null,
      maxUsage: null,
      usedCount: 0,
      minItems: 2,
      maxItems: null,
      isStackable: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: 'item_1',
          bundleId: 'bundle_1',
          productId: 'prod_1',
          quantity: 1,
          isRequired: true,
          bonusQuantity: 0,
          product: {
            id: 'prod_1',
            name: 'Product 1',
            price: new Prisma.Decimal('99.99')
          }
        }
      ]
    }

    expect(bundle.items).toHaveLength(1)
    expect(bundle.items[0].product.name).toBe('Product 1')
  })

  test('BundleItemWithProduct should have nested product with required fields', () => {
    const item: BundleItemWithProduct = {
      id: 'item_1',
      bundleId: 'bundle_1',
      productId: 'prod_1',
      quantity: 2,
      isRequired: true,
      bonusQuantity: 0,
      product: {
        id: 'prod_1',
        name: 'Product 1',
        price: new Prisma.Decimal('49.99')
      }
    }

    expect(item.product.id).toBe('prod_1')
    expect(item.product.name).toBe('Product 1')
    expect(item.product.price.toNumber()).toBe(49.99)
    expect(item.quantity).toBe(2)
  })

  test('Prisma.BundleWhereInput should be used for query filters', () => {
    const whereClause: Prisma.BundleWhereInput = {
      status: 'ACTIVE',
      OR: [
        { endDate: null },
        { endDate: { gte: new Date() } }
      ]
    }

    expect(whereClause.status).toBe('ACTIVE')
    expect(whereClause.OR).toHaveLength(2)
  })

  test('Prisma.BundleUpdateInput should be used for update operations', () => {
    const updateData: Prisma.BundleUpdateInput = {
      name: 'Updated Bundle',
      status: 'INACTIVE',
      startDate: new Date(),
      endDate: new Date()
    }

    expect(updateData.name).toBe('Updated Bundle')
    expect(updateData.status).toBe('INACTIVE')
  })
})
