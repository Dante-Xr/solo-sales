import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import AffiliateService from '@/lib/affiliate/AffiliateService'
import { safeErrorLog } from '@/lib/safeLog'

const affiliateService = new AffiliateService(prisma)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, orderId, userId, orderAmount } = body

    if (!code || !orderId || !userId || !orderAmount) {
      return NextResponse.json(
        { error: 'Code, orderId, userId, and orderAmount are required' },
        { status: 400 }
      )
    }

    await affiliateService.recordConversion(code, orderId, userId, orderAmount)

    return NextResponse.json({ success: true })
  } catch (error) {
    safeErrorLog(error, 'Failed to record conversion')
    return NextResponse.json(
      { error: 'Failed to record conversion' },
      { status: 500 }
    )
  }
}