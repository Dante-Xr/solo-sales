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
    const payouts = await affiliateService.getPayouts(id)

    return NextResponse.json({ payouts })
  } catch (error) {
    safeErrorLog(error, 'Failed to get payouts')
    return NextResponse.json(
      { error: 'Failed to get payouts' },
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
    const { amount, method, payoutInfo } = body

    if (!amount || !method) {
      return NextResponse.json(
        { error: 'Amount and method are required' },
        { status: 400 }
      )
    }

    const payout = await affiliateService.requestPayout({
      affiliateId: id,
      amount,
      method,
      payoutInfo
    })

    return NextResponse.json({ payout }, { status: 201 })
  } catch (error) {
    safeErrorLog(error, 'Failed to request payout')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to request payout' },
      { status: 500 }
    )
  }
}