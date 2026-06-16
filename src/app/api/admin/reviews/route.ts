/**
 * 修改时间：2026-05-02 20:33:38 +08:00
 * 修改内容：统一后台评论审核路由响应与错误处理，并补齐批量精选/取消精选操作。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 后台管理评论审核 API (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 获取待审核评论列表
 *   - 审核通过/拒绝评论
 *   - 设置精选评论
 * ============================================
 */

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest, notFound } from "@/server/contracts/errors"
import { requireAdminPermission } from "@/server/services/admin-service"

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "reviews.view")

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

    return successResponse({
      reviews,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminPermission(request, "reviews.update")

    const body = await request.json()
    const { action, reviewIds, reviewId, content } = body

    if (reviewId) {
      if (action === "approve") {
        await prisma.review.update({
          where: { id: reviewId },
          data: { isApproved: true },
        })
      } else if (action === "reject") {
        await prisma.review.delete({
          where: { id: reviewId },
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
      } else if (action === "reply") {
        if (!content || typeof content !== "string" || !content.trim()) {
          throw badRequest("回复内容不能为空")
        }

        const existingReview = await prisma.review.findUnique({
          where: { id: reviewId },
        })

        if (!existingReview) {
          throw notFound("评论")
        }

        await prisma.reviewReply.create({
          data: {
            reviewId,
            content: content.trim(),
            userId: null,
            adminId: admin.id,
          },
        })
      } else {
        throw badRequest("无效的操作")
      }

      return successResponse({
        message: `评论 ${action} 操作成功`,
      })
    }

    if (reviewIds && Array.isArray(reviewIds)) {
      const updateData: Record<string, unknown> = {}

      // 后台表格单条按钮也会走 reviewIds 分支，因此这里必须覆盖精选和取消精选。
      if (action === "approve") {
        updateData.isApproved = true
      } else if (action === "feature") {
        updateData.isFeatured = true
      } else if (action === "unfeature") {
        updateData.isFeatured = false
      } else if (action === "reject") {
        await prisma.review.deleteMany({
          where: { id: { in: reviewIds } },
        })
        return successResponse({
          message: `已拒绝 ${reviewIds.length} 条评论`,
        })
      } else if (action === "delete") {
        await prisma.review.deleteMany({
          where: { id: { in: reviewIds } },
        })
        return successResponse({
          message: `已删除 ${reviewIds.length} 条评论`,
        })
      } else {
        throw badRequest("无效的操作")
      }

      await prisma.review.updateMany({
        where: { id: { in: reviewIds } },
        data: updateData,
      })

      return successResponse({
        message: `已更新 ${reviewIds.length} 条评论`,
      })
    }

    throw badRequest("缺少 reviewId 或 reviewIds")
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminPermission(request, "reviews.update")

    const body = await request.json()
    const { reviewId, action } = body

    if (!reviewId || !action) {
      throw badRequest("缺少 reviewId 或 action")
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!existingReview) {
      throw notFound("评论")
    }

    // PUT 保留审核专用语义，只接受通过/拒绝，精选类操作统一走 POST。
    if (action === "approve") {
      await prisma.review.update({
        where: { id: reviewId },
        data: { isApproved: true },
      })
    } else if (action === "reject") {
      await prisma.review.delete({
        where: { id: reviewId },
      })
    } else {
      throw badRequest("无效的操作，支持 approve/reject")
    }

    return successResponse({
      message: action === "approve" ? "评论已通过审核" : "评论已拒绝",
    })
  } catch (error) {
    return handleApiError(error)
  }
}
