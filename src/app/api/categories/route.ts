/**
 * ============================================
 * 商品分类管理 API 路由
 * ============================================
 * 功能说明：
 *   - 获取分类列表
 *   - 创建分类
 *   - 更新分类
 *   - 删除分类
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

/**
 * 创建分类请求体校验 schema
 */
const createCategorySchema = z.object({
  name: z.string().min(1, "分类名称不能为空"),
  description: z.string().optional(),
})

/**
 * 更新分类请求体校验 schema
 */
const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
})

/**
 * GET /api/categories - 获取分类列表
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error("获取分类列表失败:", error)
    return NextResponse.json(
      { success: false, error: "获取分类列表失败" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/categories - 创建分类
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createCategorySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "参数错误", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data

    // 检查名称是否已存在
    const existing = await prisma.category.findFirst({
      where: { name: data.name },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: "该分类名称已存在" },
        { status: 409 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (error) {
    console.error("创建分类失败:", error)
    return NextResponse.json(
      { success: false, error: "创建分类失败" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/categories - 更新分类
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "缺少分类 ID" },
        { status: 400 }
      )
    }

    const parsed = updateCategorySchema.safeParse(updateData)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "参数错误", details: parsed.error.issues },
        { status: 400 }
      )
    }

    // 检查分类是否存在
    const existing = await prisma.category.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "分类不存在" },
        { status: 404 }
      )
    }

    // 检查名称是否与其他分类冲突（如果提供了新名称）
    if (parsed.data.name && parsed.data.name !== existing.name) {
      const conflict = await prisma.category.findFirst({
        where: { name: parsed.data.name, id: { not: id } },
      })
      if (conflict) {
        return NextResponse.json(
          { success: false, error: "该分类名称已存在" },
          { status: 409 }
        )
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: parsed.data,
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error("更新分类失败:", error)
    return NextResponse.json(
      { success: false, error: "更新分类失败" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/categories - 删除分类
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: "缺少分类 ID" },
        { status: 400 }
      )
    }

    // 检查分类是否存在
    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "分类不存在" },
        { status: 404 }
      )
    }

    // 检查是否有产品关联
    if (existing._count.products > 0) {
      return NextResponse.json(
        { success: false, error: "该分类下存在产品，无法删除" },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: "删除成功" })
  } catch (error) {
    console.error("删除分类失败:", error)
    return NextResponse.json(
      { success: false, error: "删除分类失败" },
      { status: 500 }
    )
  }
}
