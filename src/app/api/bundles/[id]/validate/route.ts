import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
    const { items } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    const validation = await bundleService.validateBundleForOrder(id, items)

    if (!validation.valid) {
      return NextResponse.json({ valid: false, errors: validation.errors }, { status: 400 })
    }

    const itemsWithPrices = await Promise.all(
      items.map(async (item: { productId: string; quantity: number }) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        })
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product ? Number(product.price) : 0
        }
      })
    )

    const { discount, finalTotal } = await bundleService.calculateOrderDiscount(id, itemsWithPrices)

    return NextResponse.json({
      valid: true,
      discount,
      finalTotal,
      totalOriginal: itemsWithPrices.reduce((sum, item) => sum + item.price * item.quantity, 0)
    })
  } catch (error) {
    safeErrorLog(error, 'Failed to validate bundle for order')
    return NextResponse.json(
      { error: 'Failed to validate bundle' },
      { status: 500 }
    )
  }
}