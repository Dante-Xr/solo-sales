/**
 * ?????2026-05-27
 * ????v0.1.0
 * ??????? 10 - SoloSales ??
 * ?????
 * 1. ? /api/chat POST ?? Python CustomerService?
 * 2. ?????? userId/userEmail?????? session ??????
 * 3. Python ???????? fallback??? { success, data } ?????
 */
import { NextRequest, NextResponse } from "next/server"
import { getAiCustomerConfig } from "@/server/config/ai-customer"
import { getServerSessionUser } from "@/server/auth/session"
import { callAiCustomerService } from "@/server/services/ai-customer-client"
import { buildSafeChatContext } from "@/server/services/chat-context-service"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest } from "@/server/contracts/errors"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, message } = body

    if (!sessionId || !message) {
      throw badRequest("Missing required parameters: sessionId and message")
    }

    const sessionUser = await getServerSessionUser()
    const config = getAiCustomerConfig()
    const context = await buildSafeChatContext({ sessionUser, clientBody: body })
    const result = await callAiCustomerService({
      message,
      tenantId: config.tenantId,
      context,
      locale: body.locale || config.locale,
      config,
    })

    return successResponse(
      {
        sessionId,
        response: {
          answer: result.data.answer,
          intent: result.data.intent || result.data.answer_mode,
          confidence: result.fallback ? 0 : 1,
          sources: result.data.knowledge_sources || [],
          suggestedActions: [],
          requiresHuman: result.fallback,
          answerMode: result.data.answer_mode,
          llmUsed: result.data.llm_used,
        },
        context: {
          currentIntent: result.data.intent || result.data.answer_mode,
          currentState: result.fallback ? "fallback" : "answered",
          entities: context,
        },
        aiCustomer: {
          fallback: result.fallback,
          answerMode: result.data.answer_mode,
          llmUsed: result.data.llm_used,
        },
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    return handleApiError(error, { headers: corsHeaders })
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId")

    if (!sessionId) {
      throw badRequest("Missing sessionId")
    }

    return successResponse(
      {
        sessionId,
        messages: [],
        count: 0,
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    return handleApiError(error, { headers: corsHeaders })
  }
}