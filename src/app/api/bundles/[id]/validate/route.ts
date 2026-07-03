/**
 * 修改时间：2026-05-02 19:27:31 +08:00
 * 修改内容：统一商品组合校验路由响应与错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import BundleService from "@/lib/bundle/BundleService"
import { safeErrorLog } from "@/lib/safeLog"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest } from "@/server/contracts/errors"

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
      throw badRequest("Items array is required")
    }

    const validation = await bundleService.validateBundleForOrder(id, items)

    if (!validation.valid) {
      throw badRequest("Bundle validation failed", { errors: validation.errors })
    }

    // 校验通过后按当前商品价格计算折扣，避免信任调用方传入的价格。
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

    return successResponse({
      valid: true,
      discount,
      finalTotal,
      totalOriginal: itemsWithPrices.reduce((sum, item) => sum + item.price * item.quantity, 0)
    })
  } catch (error: unknown) {
    safeErrorLog('Failed to validate bundle for order', error)
    return handleApiError(error)
  }
}
