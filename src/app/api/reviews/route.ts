/**
 * 修改时间：2026-05-02 20:27:37 +08:00
 * 修改内容：统一商品评价列表和创建路由响应与错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 商品评价 API 路由 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 获取商品的评论列表
 *   - 创建新的评论
 *   - 支持分页、筛选、排序
 * ============================================
 */

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { csrfGuard } from "@/middleware/csrf-guard"
import { createdResponse, handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest, conflict, notFound, unauthorized } from "@/server/contracts/errors"

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
      throw badRequest("缺少 productId 参数")
    }

    const where: Record<string, unknown> = {
      productId,
      isApproved: true,
    }

    // 只允许白名单排序字段，避免把任意查询参数透传到 Prisma orderBy。
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
    return handleApiError(error)
  }
}

/**
 * 创建评论
 * POST /api/reviews
 */
export async function POST(request: NextRequest) {
  const csrfError = await csrfGuard(request)
  if (csrfError) return csrfError

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      throw unauthorized("请先登录")
    }

    const body = await request.json()
    const { productId, rating, title, content, images } = body
    const userId = session.user.id

    if (!productId || !rating) {
      throw badRequest("缺少必填字段")
    }

    if (rating < 1 || rating > 5) {
      throw badRequest("评分必须在 1-5 之间")
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw notFound("商品")
    }

    const existingReview = await prisma.review.findFirst({
      where: { productId, userId },
    })

    if (existingReview) {
      throw conflict("您已评价过该商品")
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        title: title || null,
        content: content || null,
        isApproved: false,
        // 评论图片按传入顺序保存 position，前端展示时可稳定排序。
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

    return createdResponse(review)
  } catch (error) {
    return handleApiError(error)
  }
}
