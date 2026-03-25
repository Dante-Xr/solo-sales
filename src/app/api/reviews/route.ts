/**
 * ============================================
 * 商品评价 API 路由 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 获取商品的评论列表
 *   - 创建新的评论
 *   - 支持分页、筛选、排序
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse } from "@/lib/api-wrapper"

/**
 * 获取评论列表
 * GET /api/reviews?productId=X&page=1&pageSize=10&sort=createdAt
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")
    const sort = searchParams.get("sort") || "createdAt"
    const order = searchParams.get("order") || "desc"

    if (!productId) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "缺少 productId 参数" } },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = {
      productId,
      isApproved: true,
    }

    const sortField = ["createdAt", "rating", "helpfulCount"].includes(sort) ? sort : "createdAt"
    const sortOrder = order === "asc" ? "asc" : "desc"

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          images: {
            orderBy: { position: "asc" },
          },
          replies: true,
        },
        orderBy: { [sortField]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.review.count({ where }),
    ])

    const ratingStats = await prisma.review.groupBy({
      by: ["rating"],
      where: { productId, isApproved: true },
      _count: true,
    })

    const totalRating = ratingStats.reduce((acc, stat) => acc + stat.rating * stat._count, 0)
    const avgRating = total > 0 ? (totalRating / total).toFixed(1) : "0"

    return successResponse({
      reviews,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      stats: {
        averageRating: parseFloat(avgRating),
        totalReviews: total,
        ratingDistribution: ratingStats.reduce((acc, stat) => {
          acc[stat.rating] = stat._count
          return acc
        }, {} as Record<number, number>),
      },
    })
  } catch (error) {
    console.error("获取评论列表失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "获取评论列表失败" } },
      { status: 500 }
    )
  }
}

/**
 * 创建评论
 * POST /api/reviews
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, userId, rating, title, content, images } = body

    if (!productId || !userId || !rating) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "缺少必填字段" } },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "评分必须在 1-5 之间" } },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "商品不存在" } },
        { status: 404 }
      )
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        title: title || null,
        content: content || null,
        isApproved: false,
        images: images && images.length > 0
          ? {
              create: images.map((url: string, index: number) => ({
                url,
                position: index,
              })),
            }
          : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        images: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: review,
        message: "评论提交成功，等待审核",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("创建评论失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "创建评论失败" } },
      { status: 500 }
    )
  }
}