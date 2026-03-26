import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import EmailSequenceEngine from '@/lib/marketing/EmailSequenceEngine'
import { safeErrorLog } from '@/lib/safeLog'

const engine = new EmailSequenceEngine(prisma)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sequence = await engine.getSequenceById(id)

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    const stats = await engine.getEnrollmentStats(id)

    return NextResponse.json({ sequence, stats })
  } catch (error) {
    safeErrorLog(error, 'Failed to get sequence')
    return NextResponse.json(
      { error: 'Failed to get sequence' },
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

    const sequence = await engine.updateSequence(id, body)

    return NextResponse.json({ sequence })
  } catch (error) {
    safeErrorLog(error, 'Failed to update sequence')
    return NextResponse.json(
      { error: 'Failed to update sequence' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await engine.deleteSequence(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    safeErrorLog(error, 'Failed to delete sequence')
    return NextResponse.json(
      { error: 'Failed to delete sequence' },
      { status: 500 }
    )
  }
}