/**
 * ============================================
 * 产品详情 API 路由 (Task 2.4)
 * ============================================
 * 功能说明：
 *   - 获取产品详情
 *   - 更新产品信息
 *   - 删除产品
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

/**
 * 更新产品请求体校验 schema
 */
const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
  sku: z.string().nullable().optional(),
})

/**
 * GET /api/products/[id] - 获取产品详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true },
        },
        _count: {
          select: { orderItems: true },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: "产品不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error("获取产品详情失败:", error)
    return NextResponse.json(
      { success: false, error: "获取产品详情失败" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/products/[id] - 更新产品
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = updateProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "参数错误", details: parsed.error.issues },
        { status: 400 }
      )
    }

    // 检查产品是否存在
    const existing = await prisma.product.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "产品不存在" },
        { status: 404 }
      )
    }

    // 检查 SKU 是否与其他产品冲突（如果提供了新 SKU）
    if (parsed.data.sku && parsed.data.sku !== existing.sku) {
      const conflict = await prisma.product.findUnique({
        where: { sku: parsed.data.sku },
      })
      if (conflict) {
        return NextResponse.json(
          { success: false, error: "该 SKU 已存在" },
          { status: 409 }
        )
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error("更新产品失败:", error)
    return NextResponse.json(
      { success: false, error: "更新产品失败" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/products/[id] - 删除产品
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 检查产品是否存在
    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "产品不存在" },
        { status: 404 }
      )
    }

    // 检查是否有订单关联
    if (existing._count.orderItems > 0) {
      return NextResponse.json(
        { success: false, error: "该产品存在订单关联，无法删除" },
        { status: 400 }
      )
    }

    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: "删除成功" })
  } catch (error) {
    console.error("删除产品失败:", error)
    return NextResponse.json(
      { success: false, error: "删除产品失败" },
      { status: 500 }
    )
  }
}
