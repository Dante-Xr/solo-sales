/**
 * 修改时间：2026-05-02 20:27:37 +08:00
 * 修改内容：统一商品评价详情、更新和删除路由响应与错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 商品评价详情 API 路由 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 获取评论详情
 *   - 更新评论
 *   - 删除评论
 * ============================================
 */

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest, forbidden, notFound, unauthorized } from "@/server/contracts/errors"
import { getServerSessionUser } from "@/server/auth/session"

/**
 * 获取评论详情
 * GET /api/reviews/[id]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          orderBy: { position: "asc" },
        },
        replies: true,
      },
    })

    if (!review) {
      throw notFound("评论")
    }

    return successResponse(review)
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

/**
 * 更新评论
 * PUT /api/reviews/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getServerSessionUser()
    if (!sessionUser?.id) {
      throw unauthorized("请先登录")
    }

    const { id } = await params

    const existingReview = await prisma.review.findUnique({
      where: { id },
    })

    if (!existingReview) {
      throw notFound("评论")
    }

    if (existingReview.userId !== sessionUser.id) {
      throw forbidden("只能修改自己的评论")
    }

    const body = await request.json()
    const { rating, title, content, images } = body

    const updateData: Record<string, unknown> = {}
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        throw badRequest("评分必须在 1-5 之间")
      }
      updateData.rating = rating
    }
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content

    if (images !== undefined) {
      // 图片是整体替换语义：先删除旧图，再按新顺序重建 position。
      await prisma.reviewImage.deleteMany({
        where: { reviewId: id },
      })

      if (images.length > 0) {
        await prisma.reviewImage.createMany({
          data: images.map((url: string, index: number) => ({
            reviewId: id,
            url,
            position: index,
          })),
        })
      }
    }

    const review = await prisma.review.update({
      where: { id },
      data: updateData,
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

    return successResponse(review)
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

/**
 * 删除评论
 * DELETE /api/reviews/[id]
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getServerSessionUser()
    if (!sessionUser?.id) {
      throw unauthorized("请先登录")
    }

    const { id } = await params

    const existingReview = await prisma.review.findUnique({
      where: { id },
    })

    if (!existingReview) {
      throw notFound("评论")
    }

    if (existingReview.userId !== sessionUser.id) {
      throw forbidden("只能删除自己的评论")
    }

    await prisma.review.delete({
      where: { id },
    })

    return successResponse({ deleted: true }, { meta: { message: "评论已删除" } })
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
