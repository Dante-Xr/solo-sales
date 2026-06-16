/**
 * 修改时间：2026-05-02 20:43:25 +08:00
 * 修改内容：统一客服反馈路由响应与错误处理，并兼容前端小写满意度评分。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * RAG 客服反馈 API (v0.6.0)
 * ============================================
 * POST /api/chat/feedback - 提交满意度评价
 * DELETE /api/chat/history - 清除对话历史
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getConversationManager } from "@/lib/rag/ConversationManager"
import { SatisfactionRating } from "@/lib/rag/types"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest, forbidden, notFound, unauthorized } from "@/server/contracts/errors"
import { getServerSessionUser } from "@/server/auth/session"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}

const ratingMap: Record<string, SatisfactionRating> = {
  SATISFIED: "SATISFIED",
  NEUTRAL: "NEUTRAL",
  DISSATISFIED: "DISSATISFIED",
  satisfied: "SATISFIED",
  neutral: "NEUTRAL",
  dissatisfied: "DISSATISFIED",
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}

/**
 * POST /api/chat/feedback - 提交满意度评价
 */
export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getServerSessionUser()
    if (!sessionUser?.id) {
      throw unauthorized("请先登录")
    }

    const body = await request.json()
    const { sessionId, rating, comment } = body

    if (!sessionId || !rating) {
      throw badRequest("缺少必要参数 sessionId 或 rating")
    }

    // 前端组件发送小写评分，后端持久化前统一映射为 RAG 领域类型。
    const normalizedRating = typeof rating === "string" ? ratingMap[rating] : undefined
    if (!normalizedRating) {
      throw badRequest("无效的评分值")
    }

    await requireOwnedConversation(sessionId, sessionUser.id)

    const conversationManager = getConversationManager()
    await conversationManager.submitFeedback(sessionId, normalizedRating, comment)

    return successResponse({
      message: "反馈已提交，感谢您的评价"
    }, { headers: corsHeaders })

  } catch (error) {
    return handleApiError(error, { headers: corsHeaders })
  }
}

/**
 * DELETE /api/chat/history - 清除对话历史
 */
export async function DELETE(request: NextRequest) {
  try {
    const sessionUser = await getServerSessionUser()
    if (!sessionUser?.id) {
      throw unauthorized("请先登录")
    }

    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      throw badRequest("缺少 sessionId 参数")
    }

    await requireOwnedConversation(sessionId, sessionUser.id)

    const conversationManager = getConversationManager()
    await conversationManager.clearHistory(sessionId)

    return successResponse({
      message: "对话历史已清除"
    }, { headers: corsHeaders })

  } catch (error) {
    return handleApiError(error, { headers: corsHeaders })
  }
}

async function requireOwnedConversation(sessionId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: sessionId },
    select: { id: true, userId: true },
  })

  if (!conversation) {
    throw notFound("对话")
  }

  if (conversation.userId !== userId) {
    throw forbidden("只能操作自己的对话")
  }
}
