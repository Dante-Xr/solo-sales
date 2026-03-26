/**
 * ============================================
 * 产品批量操作 API 路由 (v0.5.8)
 * ============================================
 * 功能说明：
 *   - 批量更新产品状态（上架/下架）
 *   - 批量删除产品
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { cacheDelPattern } from "@/lib/cache"

/**
 * 批量更新产品请求体校验 schema
 */
const batchUpdateSchema = z.object({
  ids: z.array(z.string()).min(1, "至少选择一个产品"),
  isPublished: z.boolean(),
})

/**
 * PATCH /api/products/batch - 批量更新产品状态
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = batchUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "参数错误", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { ids, isPublished } = parsed.data

    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isPublished },
    })

    await cacheDelPattern("solo:products:list:*")

    return NextResponse.json({
      success: true,
      message: isPublished ? "批量上架成功" : "批量下架成功",
      data: { count: ids.length },
    })
  } catch (error) {
    console.error("批量更新产品失败:", error)
    return NextResponse.json(
      { success: false, error: "批量更新产品失败" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/products/batch - 批量删除产品
 * 使用事务确保数据一致性
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const idsParam = searchParams.get("ids")

    if (!idsParam) {
      return NextResponse.json(
        { success: false, error: "缺少产品 ID 参数" },
        { status: 400 }
      )
    }

    const ids = idsParam.split(",").filter(Boolean)

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "至少选择一个产品" },
        { status: 400 }
      )
    }

    // 使用事务确保检查和删除的原子性
    const result = await prisma.$transaction(async (tx) => {
      const productsWithOrders = await tx.product.findMany({
        where: { id: { in: ids } },
        include: {
          _count: {
            select: { orderItems: true },
          },
        },
      })

      const productsWithOrderItems = productsWithOrders.filter(
        (p) => p._count.orderItems > 0
      )

      if (productsWithOrderItems.length > 0) {
        throw new Error(`${productsWithOrderItems.length} 个产品存在订单关联，无法删除`)
      }

      return tx.product.deleteMany({
        where: { id: { in: ids } },
      })
    })

    await cacheDelPattern("solo:products:list:*")

    return NextResponse.json({
      success: true,
      message: "批量删除成功",
      data: { count: result.count },
    })
  } catch (error) {
    console.error("批量删除产品失败:", error)
    const message = error instanceof Error ? error.message : "批量删除产品失败"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}