import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import AffiliateService from '@/lib/affiliate/AffiliateService'
import { AffiliateStatus } from '@prisma/client'
import { safeErrorLog } from '@/lib/safeLog'

const affiliateService = new AffiliateService(prisma)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const affiliate = await affiliateService.getAffiliateById(id)

    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 })
    }

    const stats = await affiliateService.getAffiliateStats(id)

    return NextResponse.json({ affiliate, stats })
  } catch (error) {
    safeErrorLog('Failed to get affiliate', error)
    return NextResponse.json(
      { error: 'Failed to get affiliate' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { status, commissionRate, payoutMethod, payoutInfo } = body

    let affiliate

    if (status) {
      affiliate = await affiliateService.updateAffiliateStatus(id, status as AffiliateStatus)
    } else {
      affiliate = await affiliateService.updateAffiliate(id, {
        commissionRate,
        payoutMethod,
        payoutInfo
      })
    }

    return NextResponse.json({ affiliate })
  } catch (error) {
    safeErrorLog('Failed to update affiliate', error)
    return NextResponse.json(
      { error: 'Failed to update affiliate' },
      { status: 500 }
    )
  }
}