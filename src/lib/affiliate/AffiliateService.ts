import {
  PrismaClient,
  AffiliateStatus,
  CommissionStatus,
  PayoutStatus
} from '@prisma/client'
import { cacheGet, cacheSet, cacheDel } from '../cache'
import {
  AffiliateData,
  AffiliateLinkData,
  CommissionData,
  PayoutData,
  AffiliateStats,
  CreateAffiliateInput,
  CreateAffiliateLinkInput,
  RequestPayoutInput
} from './types'
import { safeErrorLog } from '../safeLog'

const CACHE_TTL = 300

function generateAffiliateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

class AffiliateService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async getAffiliates(filters?: {
    status?: AffiliateStatus
  }): Promise<AffiliateData[]> {
    const where: Record<string, unknown> = {}
    if (filters?.status) {
      where.status = filters.status
    }

    const affiliates = await this.prisma.affiliate.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return affiliates.map(a => this.mapAffiliateData(a))
  }

  async getAffiliateById(id: string): Promise<AffiliateData | null> {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { id }
    })

    return affiliate ? this.mapAffiliateData(affiliate) : null
  }

  async getAffiliateByUserId(userId: string): Promise<AffiliateData | null> {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { userId }
    })

    return affiliate ? this.mapAffiliateData(affiliate) : null
  }

  async createAffiliate(data: CreateAffiliateInput): Promise<AffiliateData> {
    const existing = await this.prisma.affiliate.findUnique({
      where: { userId: data.userId }
    })

    if (existing) {
      throw new Error('User is already an affiliate')
    }

    const affiliate = await this.prisma.affiliate.create({
      data: {
        userId: data.userId,
        commissionRate: data.commissionRate ?? 10,
        payoutMethod: data.payoutMethod,
        payoutInfo: data.payoutInfo,
        status: AffiliateStatus.PENDING
      }
    })

    return this.mapAffiliateData(affiliate)
  }

  async updateAffiliateStatus(id: string, status: AffiliateStatus): Promise<AffiliateData> {
    const updateData: Record<string, unknown> = { status }

    if (status === AffiliateStatus.ACTIVE) {
      updateData.approvedAt = new Date()
    }

    const affiliate = await this.prisma.affiliate.update({
      where: { id },
      data: updateData
    })

    return this.mapAffiliateData(affiliate)
  }

  async updateAffiliate(id: string, data: {
    commissionRate?: number
    payoutMethod?: string
    payoutInfo?: Record<string, unknown>
  }): Promise<AffiliateData> {
    const affiliate = await this.prisma.affiliate.update({
      where: { id },
      data
    })

    return this.mapAffiliateData(affiliate)
  }

  async createAffiliateLink(data: CreateAffiliateLinkInput): Promise<AffiliateLinkData> {
    let code = generateAffiliateCode()

    const existing = await this.prisma.affiliateLink.findUnique({ where: { code } })
    while (existing) {
      code = generateAffiliateCode()
    }

    const link = await this.prisma.affiliateLink.create({
      data: {
        affiliateId: data.affiliateId,
        code,
        productId: data.productId,
        campaign: data.campaign,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
      }
    })

    return this.mapAffiliateLinkData(link)
  }

  async getAffiliateLink(id: string): Promise<AffiliateLinkData | null> {
    const link = await this.prisma.affiliateLink.findUnique({
      where: { id }
    })

    return link ? this.mapAffiliateLinkData(link) : null
  }

  async getAffiliateLinkByCode(code: string): Promise<AffiliateLinkData | null> {
    const link = await this.prisma.affiliateLink.findUnique({
      where: { code }
    })

    return link ? this.mapAffiliateLinkData(link) : null
  }

  async getAffiliateLinks(affiliateId: string): Promise<AffiliateLinkData[]> {
    const links = await this.prisma.affiliateLink.findMany({
      where: { affiliateId },
      orderBy: { createdAt: 'desc' }
    })

    return links.map(l => this.mapAffiliateLinkData(l))
  }

  async deleteAffiliateLink(id: string): Promise<void> {
    await this.prisma.affiliateLink.delete({ where: { id } })
  }

  async recordClick(code: string): Promise<void> {
    const link = await this.prisma.affiliateLink.findUnique({ where: { code } })
    if (link) {
      await this.prisma.affiliateLink.update({
        where: { id: link.id },
        data: { clicks: { increment: 1 } }
      })
    }
  }

  async recordConversion(code: string, orderId: string, userId: string, orderAmount: number): Promise<void> {
    const link = await this.prisma.affiliateLink.findUnique({ where: { code } })

    if (!link) return

    const affiliate = await this.prisma.affiliate.findUnique({
      where: { id: link.affiliateId }
    })

    if (!affiliate || affiliate.status !== AffiliateStatus.ACTIVE) return

    const commissionAmount = orderAmount * (Number(affiliate.commissionRate) / 100)

    await this.prisma.$transaction([
      this.prisma.affiliateLink.update({
        where: { id: link.id },
        data: { conversions: { increment: 1 } }
      }),
      this.prisma.affiliateCommission.create({
        data: {
          affiliateId: affiliate.id,
          linkId: link.id,
          orderId,
          userId,
          amount: orderAmount,
          commission: commissionAmount,
          rate: Number(affiliate.commissionRate),
          status: CommissionStatus.PENDING
        }
      })
    ])
  }

  async getCommissions(affiliateId: string, filters?: {
    status?: CommissionStatus
  }): Promise<CommissionData[]> {
    const where: Record<string, unknown> = { affiliateId }
    if (filters?.status) {
      where.status = filters.status
    }

    const commissions = await this.prisma.affiliateCommission.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return commissions.map(c => this.mapCommissionData(c))
  }

  async getAffiliateStats(affiliateId: string): Promise<AffiliateStats> {
    const cacheKey = `solo:affiliate:stats:${affiliateId}`
    const cached = await cacheGet(cacheKey)

    if (cached) {
      return JSON.parse(cached)
    }

    const [links, commissions] = await Promise.all([
      this.prisma.affiliateLink.findMany({ where: { affiliateId } }),
      this.prisma.affiliateCommission.findMany({ where: { affiliateId } })
    ])

    const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0)
    const totalConversions = links.reduce((sum, l) => sum + l.conversions, 0)

    const pendingCommission = commissions
      .filter(c => c.status === CommissionStatus.PENDING)
      .reduce((sum, c) => sum + Number(c.commission), 0)

    const approvedCommission = commissions
      .filter(c => c.status === CommissionStatus.APPROVED)
      .reduce((sum, c) => sum + Number(c.commission), 0)

    const paidCommission = commissions
      .filter(c => c.status === CommissionStatus.PAID)
      .reduce((sum, c) => sum + Number(c.commission), 0)

    const stats: AffiliateStats = {
      totalClicks,
      totalConversions,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
      pendingCommission,
      approvedCommission,
      paidCommission,
      totalEarned: pendingCommission + approvedCommission + paidCommission
    }

    await cacheSet(cacheKey, JSON.stringify(stats), CACHE_TTL)
    return stats
  }

  async requestPayout(data: RequestPayoutInput): Promise<PayoutData> {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { id: data.affiliateId }
    })

    if (!affiliate) {
      throw new Error('Affiliate not found')
    }

    if (Number(affiliate.balance) < data.amount) {
      throw new Error('Insufficient balance')
    }

    const payout = await this.prisma.affiliatePayout.create({
      data: {
        affiliateId: data.affiliateId,
        amount: data.amount,
        method: data.method,
        status: PayoutStatus.PENDING
      }
    })

    await this.prisma.affiliate.update({
      where: { id: data.affiliateId },
      data: { balance: { decrement: data.amount } }
    })

    await cacheDel(`solo:affiliate:stats:${data.affiliateId}`)

    return this.mapPayoutData(payout)
  }

  async getPayouts(affiliateId: string): Promise<PayoutData[]> {
    const payouts = await this.prisma.affiliatePayout.findMany({
      where: { affiliateId },
      orderBy: { createdAt: 'desc' }
    })

    return payouts.map(p => this.mapPayoutData(p))
  }

  async updatePayoutStatus(id: string, status: PayoutStatus, transactionId?: string): Promise<PayoutData> {
    const payout = await this.prisma.affiliatePayout.update({
      where: { id },
      data: {
        status,
        transactionId,
        processedAt: [PayoutStatus.COMPLETED, PayoutStatus.FAILED].includes(status) ? new Date() : null
      }
    })

    if (status === PayoutStatus.COMPLETED) {
      const affiliate = await this.prisma.affiliate.findUnique({
        where: { id: payout.affiliateId }
      })

      if (affiliate) {
        await this.prisma.affiliate.update({
          where: { id: payout.affiliateId },
          data: { totalPaid: { increment: Number(payout.amount) } }
        })
      }

      await this.prisma.affiliateCommission.updateMany({
        where: {
          affiliateId: payout.affiliateId,
          status: CommissionStatus.APPROVED
        },
        data: { status: CommissionStatus.PAID, paidAt: new Date() }
      })

      await cacheDel(`solo:affiliate:stats:${payout.affiliateId}`)
    }

    return this.mapPayoutData(payout)
  }

  async approveCommission(commissionId: string): Promise<CommissionData> {
    const commission = await this.prisma.affiliateCommission.update({
      where: { id: commissionId },
      data: { status: CommissionStatus.APPROVED }
    })

    const affiliate = await this.prisma.affiliate.findUnique({
      where: { id: commission.affiliateId }
    })

    if (affiliate) {
      await this.prisma.affiliate.update({
        where: { id: commission.affiliateId },
        data: { balance: { increment: Number(commission.commission) } }
      })
    }

    await cacheDel(`solo:affiliate:stats:${commission.affiliateId}`)

    return this.mapCommissionData(commission)
  }

  private mapAffiliateData(a: any): AffiliateData {
    return {
      id: a.id,
      userId: a.userId,
      status: a.status,
      commissionRate: Number(a.commissionRate),
      balance: Number(a.balance),
      totalEarned: Number(a.totalEarned),
      totalPaid: Number(a.totalPaid),
      payoutMethod: a.payoutMethod,
      payoutInfo: a.payoutInfo,
      approvedAt: a.approvedAt,
      createdAt: a.createdAt
    }
  }

  private mapAffiliateLinkData(l: any): AffiliateLinkData {
    return {
      id: l.id,
      affiliateId: l.affiliateId,
      code: l.code,
      productId: l.productId,
      campaign: l.campaign,
      clicks: l.clicks,
      conversions: l.conversions,
      createdAt: l.createdAt,
      expiresAt: l.expiresAt
    }
  }

  private mapCommissionData(c: any): CommissionData {
    return {
      id: c.id,
      affiliateId: c.affiliateId,
      linkId: c.linkId,
      orderId: c.orderId,
      userId: c.userId,
      amount: Number(c.amount),
      commission: Number(c.commission),
      rate: Number(c.rate),
      status: c.status,
      paidAt: c.paidAt,
      createdAt: c.createdAt
    }
  }

  private mapPayoutData(p: any): PayoutData {
    return {
      id: p.id,
      affiliateId: p.affiliateId,
      amount: Number(p.amount),
      method: p.method,
      status: p.status,
      transactionId: p.transactionId,
      notes: p.notes,
      processedAt: p.processedAt,
      createdAt: p.createdAt
    }
  }
}

export default AffiliateService