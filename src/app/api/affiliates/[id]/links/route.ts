import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import AffiliateService from '@/lib/affiliate/AffiliateService'
import { safeErrorLog } from '@/lib/safeLog'

const affiliateService = new AffiliateService(prisma)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const links = await affiliateService.getAffiliateLinks(id)

    return NextResponse.json({ links })
  } catch (error) {
    safeErrorLog(error, 'Failed to get affiliate links')
    return NextResponse.json(
      { error: 'Failed to get affiliate links' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { productId, campaign, expiresAt } = body

    const link = await affiliateService.createAffiliateLink({
      affiliateId: id,
      productId,
      campaign,
      expiresAt
    })

    return NextResponse.json({ link }, { status: 201 })
  } catch (error) {
    safeErrorLog(error, 'Failed to create affiliate link')
    return NextResponse.json(
      { error: 'Failed to create affiliate link' },
      { status: 500 }
    )
  }
}