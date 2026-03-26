import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import BundleService from '@/lib/bundle/BundleService'
import { safeErrorLog } from '@/lib/safeLog'

const bundleService = new BundleService(prisma)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { productId, quantity, isRequired, bonusQuantity } = body

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
        { status: 400 }
      )
    }

    const bundle = await bundleService.addBundleItem(id, {
      productId,
      quantity,
      isRequired,
      bonusQuantity
    })

    return NextResponse.json({ bundle })
  } catch (error) {
    safeErrorLog(error, 'Failed to add bundle item')
    return NextResponse.json(
      { error: 'Failed to add bundle item' },
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
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const bundle = await bundleService.removeBundleItem(id, productId)

    return NextResponse.json({ bundle })
  } catch (error) {
    safeErrorLog(error, 'Failed to remove bundle item')
    return NextResponse.json(
      { error: 'Failed to remove bundle item' },
      { status: 500 }
    )
  }
}