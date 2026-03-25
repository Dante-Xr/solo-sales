/**
 * ============================================
 * 商品评价详情 API 路由 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 获取评论详情
 *   - 更新评论
 *   - 删除评论
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * 获取评论详情
 * GET /api/reviews/[id]
 */
export async function GET(
  request: NextRequest,
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
            email: true,
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
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "评论不存在" } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: review,
    })
  } catch (error) {
    console.error("获取评论详情失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "获取评论详情失败" } },
      { status: 500 }
    )
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
    const { id } = await params
    const body = await request.json()
    const { rating, title, content, images } = body

    const existingReview = await prisma.review.findUnique({
      where: { id },
    })

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "评论不存在" } },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return NextResponse.json(
          { success: false, error: { code: "BAD_REQUEST", message: "评分必须在 1-5 之间" } },
          { status: 400 }
        )
      }
      updateData.rating = rating
    }
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content

    if (images !== undefined) {
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

    return NextResponse.json({
      success: true,
      data: review,
    })
  } catch (error) {
    console.error("更新评论失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "更新评论失败" } },
      { status: 500 }
    )
  }
}

/**
 * 删除评论
 * DELETE /api/reviews/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingReview = await prisma.review.findUnique({
      where: { id },
    })

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "评论不存在" } },
        { status: 404 }
      )
    }

    await prisma.review.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "评论已删除",
    })
  } catch (error) {
    console.error("删除评论失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "删除评论失败" } },
      { status: 500 }
    )
  }
}