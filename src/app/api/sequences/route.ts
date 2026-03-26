import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import EmailSequenceEngine from '@/lib/marketing/EmailSequenceEngine'
import { safeErrorLog } from '@/lib/safeLog'

const engine = new EmailSequenceEngine(prisma)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const trigger = searchParams.get('trigger') as any
    const status = searchParams.get('status') as any

    const sequences = await engine.getSequences({
      trigger: trigger || undefined,
      status: status || undefined
    })

    return NextResponse.json({ sequences })
  } catch (error) {
    safeErrorLog(error, 'Failed to get sequences')
    return NextResponse.json(
      { error: 'Failed to get sequences' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, description, trigger, steps } = body

    if (!name || !trigger) {
      return NextResponse.json(
        { error: 'Name and trigger are required' },
        { status: 400 }
      )
    }

    const sequence = await engine.createSequence({
      name,
      description,
      trigger,
      steps
    })

    return NextResponse.json({ sequence }, { status: 201 })
  } catch (error) {
    safeErrorLog(error, 'Failed to create sequence')
    return NextResponse.json(
      { error: 'Failed to create sequence' },
      { status: 500 }
    )
  }
}