/**
 * ============================================
 * 后台管理评论审核 API (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 获取待审核评论列表
 *   - 审核通过/拒绝评论
 *   - 设置精选评论
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminToken } from "@/lib/adminAuth"

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "请先登录" } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")
    const productId = searchParams.get("productId")

    const where: Record<string, unknown> = {}

    if (status === "pending") {
      where.isApproved = false
    } else if (status === "approved") {
      where.isApproved = true
    }

    if (productId) {
      where.productId = productId
    }

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
          product: {
            select: {
              id: true,
              name: true,
            },
          },
          images: true,
          replies: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.review.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
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

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "请先登录" } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, reviewIds, reviewId } = body

    if (reviewId) {
      if (action === "approve") {
        await prisma.review.update({
          where: { id: reviewId },
          data: { isApproved: true },
        })
      } else if (action === "reject") {
        await prisma.review.update({
          where: { id: reviewId },
          data: { isApproved: false },
        })
      } else if (action === "feature") {
        await prisma.review.update({
          where: { id: reviewId },
          data: { isFeatured: true },
        })
      } else if (action === "unfeature") {
        await prisma.review.update({
          where: { id: reviewId },
          data: { isFeatured: false },
        })
      } else if (action === "delete") {
        await prisma.review.delete({
          where: { id: reviewId },
        })
      } else {
        return NextResponse.json(
          { success: false, error: { code: "BAD_REQUEST", message: "无效的操作" } },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `评论 ${action} 操作成功`,
      })
    }

    if (reviewIds && Array.isArray(reviewIds)) {
      const updateData: Record<string, unknown> = {}

      if (action === "approve") {
        updateData.isApproved = true
      } else if (action === "reject") {
        updateData.isApproved = false
      } else if (action === "delete") {
        await prisma.review.deleteMany({
          where: { id: { in: reviewIds } },
        })
        return NextResponse.json({
          success: true,
          message: `已删除 ${reviewIds.length} 条评论`,
        })
      }

      await prisma.review.updateMany({
        where: { id: { in: reviewIds } },
        data: updateData,
      })

      return NextResponse.json({
        success: true,
        message: `已更新 ${reviewIds.length} 条评论`,
      })
    }

    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: "缺少 reviewId 或 reviewIds" } },
      { status: 400 }
    )
  } catch (error) {
    console.error("评论操作失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "评论操作失败" } },
      { status: 500 }
    )
  }
}