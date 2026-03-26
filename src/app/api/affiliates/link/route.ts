import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import AffiliateService from '@/lib/affiliate/AffiliateService'
import { safeErrorLog } from '@/lib/safeLog'

const affiliateService = new AffiliateService(prisma)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Affiliate code is required' },
        { status: 400 }
      )
    }

    const link = await affiliateService.getAffiliateLinkByCode(code)

    if (!link) {
      return NextResponse.json(
        { error: 'Affiliate link not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ link })
  } catch (error) {
    safeErrorLog(error, 'Failed to get affiliate link by code')
    return NextResponse.json(
      { error: 'Failed to get affiliate link' },
      { status: 500 }
    )
  }
}