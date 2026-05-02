/**
 * 修改时间：2026-05-02 20:43:25 +08:00
 * 修改内容：统一智能客服对话路由响应与错误处理，保留 Edge runtime 与 CORS 响应头。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * RAG 智能客服对话 API (v0.6.0)
 * ============================================
 * POST /api/chat - 发送消息并获取回复
 * GET /api/chat/history - 获取对话历史
 * POST /api/chat/feedback - 提交满意度评价
 * DELETE /api/chat/history - 清除对话历史
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { getIntentDetectionService } from "@/lib/rag/IntentDetection"
import { getRAGService } from "@/lib/rag/RAGService"
import { getConversationManager } from "@/lib/rag/ConversationManager"
import { RAGResponse } from "@/lib/rag/types"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest } from "@/server/contracts/errors"

export const runtime = "edge"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}

/**
 * POST /api/chat - 发送消息并获取回复
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, message, userId, userEmail } = body

    if (!sessionId || !message) {
      throw badRequest("缺少必要参数 sessionId 或 message")
    }

    // 获取服务实例
    const intentService = getIntentDetectionService()
    const ragService = getRAGService()
    const conversationManager = getConversationManager()

    // 获取或创建对话上下文
    const context = await conversationManager.getOrCreateContext(sessionId, userId)

    // 识别用户意图
    const { intent, confidence } = intentService.detectIntent(message, context)

    // 提取实体
    const entities = intentService.extractEntities(message, intent)

    // 确定对话状态
    const state = intentService.determineState(intent, entities, context)

    // 保存用户消息
    await conversationManager.addMessage(sessionId, {
      role: "user",
      content: message,
      intent,
      confidence
    })

    // 更新上下文
    await conversationManager.updateContext(sessionId, {
      currentIntent: intent,
      currentState: state,
      extractedEntities: entities,
      userEmail: userEmail || context.userEmail
    })

    // 构建回复
    let response: RAGResponse

    // 根据对话状态构建不同回复：信息不足时优先追问，信息足够时执行 RAG 检索。
    if (state === "awaiting_confirmation") {
      // 需要确认信息
      const missingField = Object.keys(entities).find(
        key => !entities[key as keyof typeof entities]
      )
      const confirmQuestion = intentService.generateConfirmationQuestion(
        intent,
        missingField || "email"
      )

      response = {
        answer: confirmQuestion,
        intent,
        confidence,
        sources: [],
        suggestedActions: intentService.getSuggestedResponses(intent),
        requiresHuman: false
      }
    } else {
      // 执行 RAG 检索
      const ragResults = await ragService.retrieve(message)

      // 生成回复
      const answer = ragService.generateResponse(message, ragResults)

      // 检查是否需要转人工
      const requiresHuman = ragService.shouldEscalateToHuman(intent, confidence, {
        currentState: state
      })

      response = {
        answer,
        intent,
        confidence,
        sources: ragResults.slice(0, 3),
        suggestedActions: intentService.getSuggestedResponses(intent),
        requiresHuman
      }

      // 如果需要转人工，添加提示
      if (requiresHuman) {
        response.answer += "\n\n📞 我无法解决您的问题，将为您转接人工客服。"
      }
    }

    // 保存助手消息
    await conversationManager.addMessage(sessionId, {
      role: "assistant",
      content: response.answer,
      intent: response.intent,
      confidence: response.confidence,
      metadata: {
        sources: response.sources,
        requiresHuman: response.requiresHuman
      }
    })

    return successResponse({
      sessionId,
      response,
      context: {
        currentIntent: intent,
        currentState: state,
        entities
      }
    }, { headers: corsHeaders })

  } catch (error) {
    return handleApiError(error, { headers: corsHeaders })
  }
}

/**
 * GET /api/chat/history - 获取对话历史
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get("sessionId")
    const limit = searchParams.get("limit")

    if (!sessionId) {
      throw badRequest("缺少 sessionId 参数")
    }

    const conversationManager = getConversationManager()
    const history = await conversationManager.getHistory(
      sessionId,
      limit ? parseInt(limit) : undefined
    )

    return successResponse({
      sessionId,
      messages: history,
      count: history.length
    }, { headers: corsHeaders })

  } catch (error) {
    return handleApiError(error, { headers: corsHeaders })
  }
}
