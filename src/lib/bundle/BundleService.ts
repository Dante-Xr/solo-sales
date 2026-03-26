import { PrismaClient, DiscountType, BundleStatus } from '@prisma/client'
import { cacheGet, cacheSet, cacheDel } from '../cache'
import {
  BundleData,
  BundleItemData,
  CreateBundleInput,
  UpdateBundleInput,
  BundleValidationResult
} from './types'
import { safeErrorLog } from '../safeLog'

const CACHE_TTL = 300

class BundleService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async getBundles(filters?: {
    status?: BundleStatus
    includeExpired?: boolean
  }): Promise<BundleData[]> {
    const cacheKey = `solo:bundles:list:${JSON.stringify(filters || {})}`
    const cached = await cacheGet<BundleData[]>(cacheKey)

    if (cached) {
      return cached
    }

    const where: Record<string, unknown> = {}

    if (filters?.status) {
      where.status = filters.status
    }

    if (!filters?.includeExpired) {
      where.OR = [
        { endDate: null },
        { endDate: { gte: new Date() } }
      ]
    }

    const bundles = await this.prisma.bundle.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const result = bundles.map(b => this.calculateBundlePricing(b))

    await cacheSet(cacheKey, JSON.stringify(result), CACHE_TTL)
    return result
  }

  async getBundleBySlug(slug: string): Promise<BundleData | null> {
    const cacheKey = `solo:bundles:slug:${slug}`
    const cached = await cacheGet<BundleData | null>(cacheKey)

    if (cached) {
      return cached
    }

    const bundle = await this.prisma.bundle.findUnique({
      where: { slug },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true, stock: true, images: true }
            }
          }
        }
      }
    })

    if (!bundle) return null

    const result = this.calculateBundlePricing(bundle)

    await cacheSet(cacheKey, JSON.stringify(result), CACHE_TTL)
    return result
  }

  async getBundleById(id: string): Promise<BundleData | null> {
    const bundle = await this.prisma.bundle.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true }
            }
          }
        }
      }
    })

    if (!bundle) return null

    return this.calculateBundlePricing(bundle)
  }

  async createBundle(data: CreateBundleInput): Promise<BundleData> {
    const validation = await this.validateBundleData(data)
    if (!validation.valid) {
      throw new Error(`Invalid bundle data: ${validation.errors.join(', ')}`)
    }

    const bundle = await this.prisma.bundle.create({
      data: {
        name: data.name,
        description: data.description,
        slug: data.slug,
        discountType: data.discountType,
        discountValue: data.discountValue,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        maxUsage: data.maxUsage,
        minItems: data.minItems ?? 2,
        maxItems: data.maxItems,
        isStackable: data.isStackable ?? false,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            isRequired: item.isRequired ?? true,
            bonusQuantity: item.bonusQuantity ?? 0
          }))
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true }
            }
          }
        }
      }
    })

    await cacheDel('solo:bundles:list:*')

    return this.calculateBundlePricing(bundle)
  }

  async updateBundle(id: string, data: UpdateBundleInput): Promise<BundleData> {
    const updateData: Record<string, unknown> = { ...data }

    if (data.startDate) updateData.startDate = new Date(data.startDate)
    if (data.endDate) updateData.endDate = new Date(data.endDate)

    const bundle = await this.prisma.bundle.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true }
            }
          }
        }
      }
    })

    await cacheDel('solo:bundles:list:*')
    await cacheDel(`solo:bundles:slug:${bundle.slug}`)

    return this.calculateBundlePricing(bundle)
  }

  async addBundleItem(bundleId: string, data: {
    productId: string
    quantity: number
    isRequired?: boolean
    bonusQuantity?: number
  }): Promise<BundleData> {
    await this.prisma.bundleItem.create({
      data: {
        bundleId,
        productId: data.productId,
        quantity: data.quantity,
        isRequired: data.isRequired ?? true,
        bonusQuantity: data.bonusQuantity ?? 0
      }
    })

    await cacheDel('solo:bundles:list:*')

    const bundle = await this.getBundleById(bundleId)
    if (!bundle) throw new Error('Bundle not found')
    return bundle
  }

  async removeBundleItem(bundleId: string, productId: string): Promise<BundleData> {
    await this.prisma.bundleItem.delete({
      where: {
        bundleId_productId: { bundleId, productId }
      }
    })

    await cacheDel('solo:bundles:list:*')

    const bundle = await this.getBundleById(bundleId)
    if (!bundle) throw new Error('Bundle not found')
    return bundle
  }

  async deleteBundle(id: string): Promise<void> {
    const bundle = await this.prisma.bundle.findUnique({ where: { id } })
    await this.prisma.bundle.delete({ where: { id } })

    await cacheDel('solo:bundles:list:*')
    if (bundle) await cacheDel(`solo:bundles:slug:${bundle.slug}`)
  }

  async validateBundleForOrder(bundleId: string, selectedItems: Array<{
    productId: string
    quantity: number
  }>): Promise<BundleValidationResult> {
    const bundle = await this.getBundleById(bundleId)

    if (!bundle) {
      return { valid: false, errors: ['Bundle not found'], warnings: [] }
    }

    if (bundle.status !== BundleStatus.ACTIVE) {
      return { valid: false, errors: ['Bundle is not active'], warnings: [] }
    }

    if (bundle.startDate && new Date() < bundle.startDate) {
      return { valid: false, errors: ['Bundle has not started yet'], warnings: [] }
    }

    if (bundle.endDate && new Date() > bundle.endDate) {
      return { valid: false, errors: ['Bundle has expired'], warnings: [] }
    }

    if (bundle.maxUsage && bundle.usedCount >= bundle.maxUsage) {
      return { valid: false, errors: ['Bundle usage limit reached'], warnings: [] }
    }

    const errors: string[] = []
    const warnings: string[] = []

    const requiredItems = bundle.items.filter(i => i.isRequired)
    for (const required of requiredItems) {
      const selected = selectedItems.find(s => s.productId === required.productId)
      if (!selected || selected.quantity < required.quantity) {
        errors.push(`Required item "${required.productName}" must be included with quantity ${required.quantity}`)
      }
    }

    const selectedProductIds = selectedItems.map(s => s.productId)
    const bundleProductIds = bundle.items.map(i => i.productId)
    const invalidProducts = selectedProductIds.filter(id => !bundleProductIds.includes(id))
    if (invalidProducts.length > 0) {
      errors.push('Some selected products are not part of this bundle')
    }

    if (selectedItems.length < bundle.minItems) {
      errors.push(`Minimum ${bundle.minItems} items required`)
    }

    if (bundle.maxItems && selectedItems.length > bundle.maxItems) {
      errors.push(`Maximum ${bundle.maxItems} items allowed`)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  async calculateOrderDiscount(bundleId: string, items: Array<{
    productId: string
    quantity: number
    price: number
  }>): Promise<{ discount: number; finalTotal: number }> {
    const bundle = await this.getBundleById(bundleId)
    if (!bundle) return { discount: 0, finalTotal: 0 }

    let totalOriginal = 0
    for (const item of items) {
      const bundleItem = bundle.items.find(bi => bi.productId === item.productId)
      if (bundleItem) {
        totalOriginal += item.price * item.quantity
      }
    }

    let discount = 0
    switch (bundle.discountType) {
      case DiscountType.PERCENTAGE:
        discount = totalOriginal * (Number(bundle.discountValue) / 100)
        break
      case DiscountType.FIXED:
        discount = Number(bundle.discountValue)
        break
      case DiscountType.BUY_X_GET_Y:
        const cheapestItem = items.reduce((min, item) =>
          item.price < min.price ? item : min
        , items[0])
        discount = cheapestItem?.price || 0
        break
    }

    discount = Math.min(discount, totalOriginal)
    const finalTotal = totalOriginal - discount

    return { discount: Number(discount.toFixed(2)), finalTotal: Number(finalTotal.toFixed(2)) }
  }

  async recordBundleUsage(bundleId: string, orderId: string, discount: number): Promise<void> {
    await this.prisma.bundleOrder.create({
      data: {
        bundleId,
        orderId,
        discount
      }
    })

    await this.prisma.bundle.update({
      where: { id: bundleId },
      data: { usedCount: { increment: 1 } }
    })

    await cacheDel('solo:bundles:list:*')
  }

  private calculateBundlePricing(bundle: any): BundleData {
    const items: BundleItemData[] = bundle.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      productPrice: Number(item.product.price),
      quantity: item.quantity,
      isRequired: item.isRequired,
      bonusQuantity: item.bonusQuantity,
      subtotal: Number(item.product.price) * item.quantity
    }))

    const totalOriginalPrice = items.reduce((sum: number, item: BundleItemData) => sum + item.subtotal, 0)

    let totalDiscount = 0
    switch (bundle.discountType) {
      case 'PERCENTAGE':
        totalDiscount = totalOriginalPrice * (Number(bundle.discountValue) / 100)
        break
      case 'FIXED':
        totalDiscount = Number(bundle.discountValue)
        break
      case 'BUY_X_GET_Y':
        const cheapest = items.reduce((min: number, item: BundleItemData) =>
          item.productPrice < min ? item.productPrice : min
        , items[0]?.productPrice || 0)
        totalDiscount = cheapest
        break
    }

    totalDiscount = Math.min(totalDiscount, totalOriginalPrice)
    const finalPrice = totalOriginalPrice - totalDiscount

    return {
      id: bundle.id,
      name: bundle.name,
      description: bundle.description,
      slug: bundle.slug,
      status: bundle.status,
      discountType: bundle.discountType,
      discountValue: Number(bundle.discountValue),
      startDate: bundle.startDate,
      endDate: bundle.endDate,
      maxUsage: bundle.maxUsage,
      usedCount: bundle.usedCount,
      minItems: bundle.minItems,
      maxItems: bundle.maxItems,
      isStackable: bundle.isStackable,
      items,
      totalOriginalPrice: Number(totalOriginalPrice.toFixed(2)),
      totalDiscount: Number(totalDiscount.toFixed(2)),
      finalPrice: Number(finalPrice.toFixed(2))
    }
  }

  private async validateBundleData(data: CreateBundleInput): Promise<BundleValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    if (!data.name || data.name.length < 3) {
      errors.push('Bundle name must be at least 3 characters')
    }

    if (!data.slug || data.slug.length < 3) {
      errors.push('Bundle slug must be at least 3 characters')
    }

    const existing = await this.prisma.bundle.findUnique({ where: { slug: data.slug } })
    if (existing) {
      errors.push('Bundle slug already exists')
    }

    if (data.items.length < 2) {
      errors.push('Bundle must have at least 2 items')
    }

    for (const item of data.items) {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } })
      if (!product) {
        errors.push(`Product ${item.productId} not found`)
      } else if (item.quantity < 1) {
        errors.push(`Product quantity must be at least 1`)
      }
    }

    if (data.discountType === DiscountType.PERCENTAGE && (data.discountValue < 0 || data.discountValue > 100)) {
      errors.push('Percentage discount must be between 0 and 100')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
}

export default BundleService
