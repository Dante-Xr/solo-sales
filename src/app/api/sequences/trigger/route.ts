import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import EmailSequenceEngine from '@/lib/marketing/EmailSequenceEngine'
import { TriggerType } from '@prisma/client'
import { safeErrorLog } from '@/lib/safeLog'

const engine = new EmailSequenceEngine(prisma)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trigger, userId, data } = body

    if (!trigger || !userId) {
      return NextResponse.json(
        { error: 'Trigger type and user ID are required' },
        { status: 400 }
      )
    }

    const validTriggers: TriggerType[] = [
      'ORDER_PLACED', 'ORDER_PAID', 'ORDER_SHIPPED', 'ORDER_DELIVERED',
      'CART_ABANDONED', 'PRODUCT_VIEWED', 'CUSTOMER_INACTIVE',
      'BIRTHDAY', 'FIRST_PURCHASE', 'MEMBERSHIP_TIER'
    ]

    if (!validTriggers.includes(trigger)) {
      return NextResponse.json(
        { error: 'Invalid trigger type' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    })

    if (!user?.email) {
      return NextResponse.json(
        { error: 'User not found or has no email' },
        { status: 404 }
      )
    }

    const results = await engine.processTrigger(trigger as TriggerType, {
      userId,
      userEmail: user.email,
      data
    })

    return NextResponse.json({ results })
  } catch (error) {
    safeErrorLog(error, 'Failed to process trigger')
    return NextResponse.json(
      { error: 'Failed to process trigger' },
      { status: 500 }
    )
  }
}