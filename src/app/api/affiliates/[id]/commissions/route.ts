import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import AffiliateService from '@/lib/affiliate/AffiliateService'
import { CommissionStatus } from '@prisma/client'
import { safeErrorLog } from '@/lib/safeLog'

const affiliateService = new AffiliateService(prisma)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as CommissionStatus | null

    const commissions = await affiliateService.getCommissions(id, {
      status: status || undefined
    })

    return NextResponse.json({ commissions })
  } catch (error) {
    safeErrorLog(error, 'Failed to get commissions')
    return NextResponse.json(
      { error: 'Failed to get commissions' },
      { status: 500 }
    )
  }
}