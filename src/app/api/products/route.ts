/**
 * ============================================
 * 产品管理 API 路由 (v0.4.1 优化版)
 * ============================================
 * 功能说明：
 *   - 获取产品列表（支持分页、筛选、搜索）
 *   - 创建新产品
 *   - 支持缓存，提升查询性能
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { cacheGet, cacheSet, cacheDelPattern, CACHE_KEYS, CACHE_TTL } from "@/lib/cache"

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
 * 支持缓存，相同参数 5 分钟内返回缓存结果
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

    // 构建缓存键
    const cacheKey = CACHE_KEYS.PRODUCT_LIST(
      JSON.stringify({ page, pageSize, keyword, category, isPublished })
    )

    // 尝试从缓存获取
    const cached = await cacheGet<{
      list: unknown[]
      pagination: { page: number; pageSize: number; total: number; totalPages: number }
    }>(cacheKey)

    if (cached) {
      return NextResponse.json({ ...cached, fromCache: true })
    }

    const skip = (page - 1) * pageSize

    // 构建 where 条件
    const where: Record<string, unknown> = {}
    if (keyword) {
      // 防止 SQL 注入：转义 LIKE 特殊字符并限制长度
      const sanitizedKeyword = keyword
        .replace(/[%_\\]/g, "\\$&")
        .slice(0, 100)
      where.OR = [
        { name: { contains: sanitizedKeyword, mode: "insensitive" } },
        { description: { contains: sanitizedKeyword, mode: "insensitive" } },
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

    const result = {
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
    }

    // 缓存 5 分钟
    await cacheSet(cacheKey, result, CACHE_TTL.MEDIUM)

    return NextResponse.json(result)
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
 * 创建后清除相关缓存
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

    // 清除产品列表缓存
    await cacheDelPattern("cache:product:list:*")

    return NextResponse.json({ success: true, data: product }, { status: 201 })
  } catch (error) {
    console.error("创建产品失败:", error)
    return NextResponse.json(
      { success: false, error: "创建产品失败" },
      { status: 500 }
    )
  }
}
