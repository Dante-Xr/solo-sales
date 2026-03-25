/**
 * ============================================
 * 评论回复 API 路由 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 添加评论回复
 *   - 删除评论回复
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params
    const body = await request.json()
    const { content, userId, adminId } = body

    if (!content) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "回复内容不能为空" } },
        { status: 400 }
      )
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "评论不存在" } },
        { status: 404 }
      )
    }

    const reply = await prisma.reviewReply.create({
      data: {
        reviewId,
        content,
        userId: userId || null,
        adminId: adminId || null,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: reply,
        message: "回复成功",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("添加回复失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "添加回复失败" } },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params
    const { searchParams } = new URL(request.url)
    const replyId = searchParams.get("replyId")

    if (!replyId) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "缺少 replyId" } },
        { status: 400 }
      )
    }

    await prisma.reviewReply.delete({
      where: { id: replyId },
    })

    return NextResponse.json({
      success: true,
      message: "回复已删除",
    })
  } catch (error) {
    console.error("删除回复失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "删除回复失败" } },
      { status: 500 }
    )
  }
}