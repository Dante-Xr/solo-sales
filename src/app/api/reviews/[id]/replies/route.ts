/**
 * 修改时间：2026-05-02 20:27:37 +08:00
 * 修改内容：统一评论回复创建和删除路由响应与错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 评论回复 API 路由 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 添加评论回复
 *   - 删除评论回复
 * ============================================
 */

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { createdResponse, handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest, notFound } from "@/server/contracts/errors"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params
    const body = await request.json()
    const { content, userId, adminId } = body

    if (!content) {
      throw badRequest("回复内容不能为空")
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      throw notFound("评论")
    }

    const reply = await prisma.reviewReply.create({
      data: {
        reviewId,
        content,
        // 用户回复和管理员回复共用一张表，通过 userId/adminId 区分来源。
        userId: userId || null,
        adminId: adminId || null,
      },
    })

    return createdResponse(reply)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: _reviewId } = await params
    const { searchParams } = new URL(request.url)
    const replyId = searchParams.get("replyId")

    if (!replyId) {
      throw badRequest("缺少 replyId")
    }

    await prisma.reviewReply.delete({
      where: { id: replyId },
    })

    return successResponse({ deleted: true }, { meta: { message: "回复已删除" } })
  } catch (error) {
    return handleApiError(error)
  }
}
