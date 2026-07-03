/**
 * AffiliateService 类型定义测试
 * 验证 Prisma Record 类型别名使用正确
 */

import { Prisma } from '@prisma/client'
import type {
  AffiliateRecord,
  AffiliateLinkRecord,
  CommissionRecord,
  PayoutRecord
} from '../affiliate/types'

describe('AffiliateService Types', () => {
  test('AffiliateRecord should match Prisma Affiliate model', () => {
    const affiliate: AffiliateRecord = {
      id: 'aff_1',
      userId: 'user_1',
      status: 'ACTIVE',
      commissionRate: 10.5,
      balance: 100.0,
      totalEarned: 500.0,
      totalPaid: 400.0,
      payoutMethod: 'paypal',
      payoutInfo: { email: 'test@example.com' },
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    expect(affiliate.userId).toBe('user_1')
    expect(affiliate.commissionRate).toBe(10.5)
  })

  test('AffiliateLinkRecord should match Prisma AffiliateLink model', () => {
    const link: AffiliateLinkRecord = {
      id: 'link_1',
      affiliateId: 'aff_1',
      code: 'REFER123',
      productId: null,
      campaign: 'summer-sale',
      clicks: 100,
      conversions: 10,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    expect(link.code).toBe('REFER123')
    expect(link.clicks).toBe(100)
  })

  test('CommissionRecord should match Prisma Commission model', () => {
    const commission: CommissionRecord = {
      id: 'comm_1',
      affiliateId: 'aff_1',
      linkId: 'link_1',
      orderId: 'order_1',
      userId: 'user_1',
      amount: 99.99,
      commission: 9.99,
      rate: 10.0,
      status: 'PENDING',
      paidAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    expect(commission.amount).toBe(99.99)
    expect(commission.commission).toBe(9.99)
  })

  test('PayoutRecord should match Prisma Payout model', () => {
    const payout: PayoutRecord = {
      id: 'payout_1',
      affiliateId: 'aff_1',
      amount: 100.0,
      method: 'paypal',
      status: 'COMPLETED',
      transactionId: 'txn_123',
      notes: 'Monthly payout',
      processedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    expect(payout.amount).toBe(100.0)
    expect(payout.method).toBe('paypal')
  })
})
