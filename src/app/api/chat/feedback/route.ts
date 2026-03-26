/**
 * ============================================
 * RAG 客服反馈 API (v0.6.0)
 * ============================================
 * POST /api/chat/feedback - 提交满意度评价
 * DELETE /api/chat/history - 清除对话历史
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { getConversationManager } from "@/lib/rag/ConversationManager"
import { SatisfactionRating } from "@/lib/rag/types"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}

/**
 * POST /api/chat/feedback - 提交满意度评价
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, rating, comment } = body

    if (!sessionId || !rating) {
      return NextResponse.json(
        { error: "缺少必要参数 sessionId 或 rating" },
        { status: 400, headers: corsHeaders }
      )
    }

    const validRatings: SatisfactionRating[] = ["satisfied", "neutral", "dissatisfied"]
    if (!validRatings.includes(rating)) {
      return NextResponse.json(
        { error: "无效的评分值" },
        { status: 400, headers: corsHeaders }
      )
    }

    const conversationManager = getConversationManager()
    await conversationManager.submitFeedback(sessionId, rating, comment)

    return NextResponse.json({
      success: true,
      message: "反馈已提交，感谢您的评价"
    }, { headers: corsHeaders })

  } catch (error) {
    console.error("Feedback API error:", error)
    return NextResponse.json(
      { error: "提交反馈失败" },
      { status: 500, headers: corsHeaders }
    )
  }
}

/**
 * DELETE /api/chat/history - 清除对话历史
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json(
        { error: "缺少 sessionId 参数" },
        { status: 400, headers: corsHeaders }
      )
    }

    const conversationManager = getConversationManager()
    await conversationManager.clearHistory(sessionId)

    return NextResponse.json({
      success: true,
      message: "对话历史已清除"
    }, { headers: corsHeaders })

  } catch (error) {
    console.error("Clear history API error:", error)
    return NextResponse.json(
      { error: "清除对话历史失败" },
      { status: 500, headers: corsHeaders }
    )
  }
}
