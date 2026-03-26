import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import BundleService from '@/lib/bundle/BundleService'
import { safeErrorLog } from '@/lib/safeLog'

const bundleService = new BundleService(prisma)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const bundle = await bundleService.getBundleById(id)

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    }

    return NextResponse.json({ bundle })
  } catch (error) {
    safeErrorLog(error, 'Failed to get bundle')
    return NextResponse.json(
      { error: 'Failed to get bundle' },
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

    const bundle = await bundleService.updateBundle(id, body)

    return NextResponse.json({ bundle })
  } catch (error) {
    safeErrorLog(error, 'Failed to update bundle')
    return NextResponse.json(
      { error: 'Failed to update bundle' },
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
    await bundleService.deleteBundle(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    safeErrorLog(error, 'Failed to delete bundle')
    return NextResponse.json(
      { error: 'Failed to delete bundle' },
      { status: 500 }
    )
  }
}