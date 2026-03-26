import { BundleStatus, DiscountType } from '@prisma/client'

export interface BundleProduct {
  productId: string
  productName: string
  productPrice: number
  quantity: number
  isRequired: boolean
  bonusQuantity: number
}

export interface BundleData {
  id: string
  name: string
  description: string | null
  slug: string
  status: BundleStatus
  discountType: DiscountType
  discountValue: number
  startDate: Date | null
  endDate: Date | null
  maxUsage: number | null
  usedCount: number
  minItems: number
  maxItems: number | null
  isStackable: boolean
  items: BundleItemData[]
  totalOriginalPrice: number
  totalDiscount: number
  finalPrice: number
}

export interface BundleItemData {
  id: string
  productId: string
  productName: string
  productPrice: number
  quantity: number
  isRequired: boolean
  bonusQuantity: number
  subtotal: number
}

export interface CreateBundleInput {
  name: string
  description?: string
  slug: string
  discountType: DiscountType
  discountValue: number
  startDate?: string
  endDate?: string
  maxUsage?: number
  minItems?: number
  maxItems?: number
  isStackable?: boolean
  items: Array<{
    productId: string
    quantity: number
    isRequired?: boolean
    bonusQuantity?: number
  }>
}

export interface UpdateBundleInput {
  name?: string
  description?: string
  status?: BundleStatus
  discountType?: DiscountType
  discountValue?: number
  startDate?: string
  endDate?: string
  maxUsage?: number
  minItems?: number
  maxItems?: number
  isStackable?: boolean
}

export interface BundleValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export {
  BundleStatus,
  DiscountType
}

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  PERCENTAGE: '百分比折扣',
  FIXED: '固定金额折扣',
  BUY_X_GET_Y: '买 X 送 Y'
}

export const BUNDLE_STATUS_LABELS: Record<BundleStatus, string> = {
  DRAFT: '草稿',
  ACTIVE: '启用',
  INACTIVE: '停用',
  ARCHIVED: '已归档'
}