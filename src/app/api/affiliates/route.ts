import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import AffiliateService from '@/lib/affiliate/AffiliateService'
import { AffiliateStatus } from '@prisma/client'
import { safeErrorLog } from '@/lib/safeLog'

const affiliateService = new AffiliateService(prisma)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as AffiliateStatus | null
    const userId = searchParams.get('userId')

    if (userId) {
      const affiliate = await affiliateService.getAffiliateByUserId(userId)
      if (!affiliate) {
        return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 })
      }
      return NextResponse.json({ affiliate })
    }

    const affiliates = await affiliateService.getAffiliates({
      status: status || undefined
    })

    return NextResponse.json({ affiliates })
  } catch (error) {
    safeErrorLog(error, 'Failed to get affiliates')
    return NextResponse.json(
      { error: 'Failed to get affiliates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, commissionRate, payoutMethod, payoutInfo } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const affiliate = await affiliateService.createAffiliate({
      userId,
      commissionRate,
      payoutMethod,
      payoutInfo
    })

    return NextResponse.json({ affiliate }, { status: 201 })
  } catch (error) {
    safeErrorLog(error, 'Failed to create affiliate')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create affiliate' },
      { status: 500 }
    )
  }
}