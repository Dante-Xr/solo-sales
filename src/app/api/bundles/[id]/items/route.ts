/**
 * 修改时间：2026-05-02 19:27:31 +08:00
 * 修改内容：统一商品组合明细增删路由响应与错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import BundleService from "@/lib/bundle/BundleService"
import { safeErrorLog } from "@/lib/safeLog"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest } from "@/server/contracts/errors"
import { requireAdminPermission } from "@/server/services/admin-service"

const bundleService = new BundleService(prisma)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(request, "bundles.update")

    const { id } = await params
    const body = await request.json()

    const { productId, quantity, isRequired, bonusQuantity } = body

    if (!productId || !quantity) {
      throw badRequest("Product ID and quantity are required")
    }

    // 添加组合商品明细时只接收明确字段，具体库存/商品存在性由 BundleService 处理。
    const bundle = await bundleService.addBundleItem(id, {
      productId,
      quantity,
      isRequired,
      bonusQuantity
    })

    return successResponse({ bundle })
  } catch (error: unknown) {
    safeErrorLog('Failed to add bundle item', error)
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(request, "bundles.update")

    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get('productId')

    if (!productId) {
      throw badRequest("Product ID is required")
    }

    const bundle = await bundleService.removeBundleItem(id, productId)

    return successResponse({ bundle })
  } catch (error: unknown) {
    safeErrorLog('Failed to remove bundle item', error)
    return handleApiError(error)
  }
}
