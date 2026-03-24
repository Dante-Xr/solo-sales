/**
 * ============================================
 * 产品管理 API 路由 (Task 2.4)
 * ============================================
 * 功能说明：
 *   - 获取产品列表（支持分页、筛选、搜索）
 *   - 创建新产品
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

/**
 * 产品列表查询参数校验 schema
 */
const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  keyword: z.string().optional(),
  category: z.string().optional(),
  isPublished: z.string().optional(),
})

/**
 * 创建产品请求体校验 schema
 */
const createProductSchema = z.object({
  name: z.string().min(1, "产品名称不能为空"),
  description: z.string().min(1, "产品描述不能为空"),
  price: z.number().positive("价格必须为正数"),
  stock: z.number().int().nonnegative("库存不能为负数").default(0),
  images: z.array(z.string()).default([]),
  categoryId: z.string().optional(),
  isPublished: z.boolean().default(true),
  sku: z.string().optional(),
})

/**
 * GET /api/products - 获取产品列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryParams = Object.fromEntries(searchParams.entries())
    const parsed = listQuerySchema.safeParse(queryParams)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "参数错误", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { page, pageSize, keyword, category, isPublished } = parsed.data
    const skip = (page - 1) * pageSize

    // 构建 where 条件
    const where: Record<string, unknown> = {}
    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
      ]
    }
    if (category) {
      where.categoryId = category
    }
    if (isPublished !== undefined) {
      where.isPublished = isPublished === "true"
    }

    // 查询数据
    const [list, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true },
          },
          _count: {
            select: { orderItems: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ])

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      success: true,
      data: {
        list,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      },
    })
  } catch (error) {
    console.error("获取产品列表失败:", error)
    return NextResponse.json(
      { success: false, error: "获取产品列表失败" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/products - 创建产品
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "参数错误", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data

    // 检查 SKU 是否已存在（如果提供了 SKU）
    if (data.sku) {
      const existing = await prisma.product.findUnique({
        where: { sku: data.sku },
      })
      if (existing) {
        return NextResponse.json(
          { success: false, error: "该 SKU 已存在" },
          { status: 409 }
        )
      }
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        images: data.images,
        categoryId: data.categoryId || null,
        isPublished: data.isPublished,
        sku: data.sku || null,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: product }, { status: 201 })
  } catch (error) {
    console.error("创建产品失败:", error)
    return NextResponse.json(
      { success: false, error: "创建产品失败" },
      { status: 500 }
    )
  }
}
