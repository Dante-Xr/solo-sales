import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import BundleService from '@/lib/bundle/BundleService'
import { BundleStatus } from '@prisma/client'
import { safeErrorLog } from '@/lib/safeLog'

const bundleService = new BundleService(prisma)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as BundleStatus | null
    const slug = searchParams.get('slug')
    const includeExpired = searchParams.get('includeExpired') === 'true'

    if (slug) {
      const bundle = await bundleService.getBundleBySlug(slug)
      if (!bundle) {
        return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
      }
      return NextResponse.json({ bundle })
    }

    const bundles = await bundleService.getBundles({
      status: status || undefined,
      includeExpired
    })

    return NextResponse.json({ bundles })
  } catch (error) {
    safeErrorLog(Failed to get bundles, error)
    return NextResponse.json(
      { error: 'Failed to get bundles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name,
      description,
      slug,
      discountType,
      discountValue,
      startDate,
      endDate,
      maxUsage,
      minItems,
      maxItems,
      isStackable,
      items
    } = body

    if (!name || !slug || !discountType || discountValue === undefined || !items) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const bundle = await bundleService.createBundle({
      name,
      description,
      slug,
      discountType,
      discountValue,
      startDate,
      endDate,
      maxUsage,
      minItems,
      maxItems,
      isStackable,
      items
    })

    return NextResponse.json({ bundle }, { status: 201 })
  } catch (error) {
    safeErrorLog(Failed to create bundle, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create bundle' },
      { status: 500 }
    )
  }
}