import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import EmailSequenceEngine from '@/lib/marketing/EmailSequenceEngine'
import { safeErrorLog } from '@/lib/safeLog'

const engine = new EmailSequenceEngine(prisma)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId, triggerData } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const enrollment = await engine.enrollUser(id, userId, triggerData)

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Failed to enroll user' },
        { status: 400 }
      )
    }

    return NextResponse.json({ enrollment }, { status: 201 })
  } catch (error) {
    safeErrorLog(error, 'Failed to enroll user')
    return NextResponse.json(
      { error: 'Failed to enroll user' },
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
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const enrollment = await engine.unenroll(id, userId)

    return NextResponse.json({ enrollment })
  } catch (error) {
    safeErrorLog(error, 'Failed to unenroll user')
    return NextResponse.json(
      { error: 'Failed to unenroll user' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId, action } = body

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      )
    }

    let enrollment

    if (action === 'pause') {
      enrollment = await engine.pauseEnrollment(id, userId)
    } else if (action === 'resume') {
      enrollment = await engine.resumeEnrollment(id, userId)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use pause or resume' },
        { status: 400 }
      )
    }

    return NextResponse.json({ enrollment })
  } catch (error) {
    safeErrorLog(error, 'Failed to update enrollment')
    return NextResponse.json(
      { error: 'Failed to update enrollment' },
      { status: 500 }
    )
  }
}