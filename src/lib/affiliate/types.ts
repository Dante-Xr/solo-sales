import { AffiliateStatus, CommissionStatus, PayoutStatus, Prisma } from '@prisma/client'

/**
 * Prisma Record 类型别名
 * 用于类型安全的数据库记录映射
 */

/**
 * Affiliate 数据库记录类型
 */
export type AffiliateRecord = Prisma.AffiliateGetPayload<{}>

/**
 * AffiliateLink 数据库记录类型
 */
export type AffiliateLinkRecord = Prisma.AffiliateLinkGetPayload<{}>

/**
 * Commission 数据库记录类型
 */
export type CommissionRecord = Prisma.AffiliateCommissionGetPayload<{}>

/**
 * Payout 数据库记录类型
 */
export type PayoutRecord = Prisma.AffiliatePayoutGetPayload<{}>

export interface AffiliateData {
  id: string
  userId: string
  status: AffiliateStatus
  commissionRate: number
  balance: number
  totalEarned: number
  totalPaid: number
  payoutMethod: string | null
  payoutInfo: Record<string, unknown> | null
  approvedAt: Date | null
  createdAt: Date
}

export interface AffiliateLinkData {
  id: string
  affiliateId: string
  code: string
  productId: string | null
  campaign: string | null
  clicks: number
  conversions: number
  createdAt: Date
  expiresAt: Date | null
  url?: string
}

export interface CommissionData {
  id: string
  affiliateId: string
  linkId: string
  orderId: string
  userId: string
  amount: number
  commission: number
  rate: number
  status: CommissionStatus
  paidAt: Date | null
  createdAt: Date
}

export interface PayoutData {
  id: string
  affiliateId: string
  amount: number
  method: string
  status: PayoutStatus
  transactionId: string | null
  notes: string | null
  processedAt: Date | null
  createdAt: Date
}

export interface AffiliateStats {
  totalClicks: number
  totalConversions: number
  conversionRate: number
  pendingCommission: number
  approvedCommission: number
  paidCommission: number
  totalEarned: number
}

export interface CreateAffiliateInput {
  userId: string
  commissionRate?: number
  payoutMethod?: string
  payoutInfo?: Record<string, unknown>
}

export interface CreateAffiliateLinkInput {
  affiliateId: string
  productId?: string
  campaign?: string
  expiresAt?: string
}

export interface RequestPayoutInput {
  affiliateId: string
  amount: number
  method: string
  payoutInfo?: Record<string, unknown>
}

export {
  AffiliateStatus,
  CommissionStatus,
  PayoutStatus
}

export const AFFILIATE_STATUS_LABELS: Record<AffiliateStatus, string> = {
  PENDING: '待审核',
  ACTIVE: '启用',
  SUSPENDED: '暂停',
  REJECTED: '已拒绝'
}

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  PENDING: '待确认',
  APPROVED: '已确认',
  PAID: '已支付',
  CANCELLED: '已取消',
  REJECTED: '已拒绝'
}

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  PENDING: '待处理',
  PROCESSING: '处理中',
  COMPLETED: '已完成',
  FAILED: '失败',
  CANCELLED: '已取消'
}