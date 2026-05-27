/**
 * ?????2026-05-27
 * ????v0.1.0
 * ??????? 10 - SoloSales ??
 * ?????
 * 1. ???? Python CustomerService ????????
 * 2. ?? Bearer token?HMAC ????? fallback?
 * 3. ?? Python ?????? /api/chat ??????
 */
import "server-only"

import { createHmac } from "node:crypto"
import type { AiCustomerConfig } from "@/server/config/ai-customer"
import type { SafeChatContext } from "./chat-redaction-service"

export interface AiCustomerAnswer {
  answer: string
  answer_mode: string
  llm_used: boolean
  intent?: string | null
  knowledge_sources?: string[]
  missing_fields?: string[]
}

export interface AiCustomerResult {
  fallback: boolean
  data: AiCustomerAnswer
}

export interface CallAiCustomerInput {
  message: string
  tenantId: string
  context: SafeChatContext
  locale: string
  config: Pick<AiCustomerConfig, "enabled" | "baseUrl" | "serviceToken" | "hmacSecret" | "timeoutMs">
  fetcher?: typeof fetch
}

export async function callAiCustomerService({
  message,
  tenantId,
  context,
  locale,
  config,
  fetcher = fetch,
}: CallAiCustomerInput): Promise<AiCustomerResult> {
  if (!config.enabled || !config.serviceToken || !config.hmacSecret) {
    return fallbackAnswer("智能客服服务未启用。")
  }

  const body = JSON.stringify({
    tenant_id: tenantId,
    message,
    context,
    locale,
  })
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const signature = createCustomerServiceSignature(body, timestamp, config.hmacSecret)

  try {
    const response = await fetcher(`${config.baseUrl.replace(/\/$/, "")}/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.serviceToken}`,
        "X-CustomerService-Timestamp": timestamp,
        "X-CustomerService-Signature": signature,
      },
      body,
      signal: AbortSignal.timeout(config.timeoutMs),
    })

    if (!response.ok) {
      return fallbackAnswer("智能客服服务暂时不可用。")
    }

    const payload = await response.json()
    if (!payload?.success || !payload?.data?.answer) {
      return fallbackAnswer("智能客服服务返回异常。")
    }

    return { fallback: false, data: payload.data }
  } catch {
    return fallbackAnswer("暂时无法连接智能客服，请稍后再试或联系人工客服。")
  }
}

export function createCustomerServiceSignature(body: string, timestamp: string, secret: string): string {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")
}

function fallbackAnswer(answer: string): AiCustomerResult {
  return {
    fallback: true,
    data: {
      answer,
      answer_mode: "fallback",
      llm_used: false,
      intent: "fallback",
      knowledge_sources: [],
      missing_fields: [],
    },
  }
}