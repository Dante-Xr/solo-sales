/**
 * ?????2026-05-27
 * ????v0.1.0
 * ??????? 10 - SoloSales ??
 * ?????
 * 1. ?? AI CustomerService ???????
 * 2. ?????????????????fallback ????????
 */
import { buildSafeChatContext } from "../chat-context-service"
import { callAiCustomerService } from "../ai-customer-client"
import { redactChatContext } from "../chat-redaction-service"

describe("AI customer service integration", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it("does not trust client supplied user identity", async () => {
    const context = await buildSafeChatContext({
      sessionUser: { id: "real-user", email: "real@example.com" },
      clientBody: {
        userId: "attacker-user",
        userEmail: "attacker@example.com",
        sessionId: "session-1",
        message: "查订单",
      },
      findOrder: jest.fn(),
    })

    expect(context.user_id).toBe("real-user")
    expect(context.user_email).toBe("real@example.com")
    expect(context.user_id).not.toBe("attacker-user")
    expect(context.user_email).not.toBe("attacker@example.com")
  })

  it("allows logged in users to attach their own order context", async () => {
    const findOrder = jest.fn().mockResolvedValue({
      id: "order-1",
      status: "SHIPPED",
      trackingNumber: "SF123",
      userId: "real-user",
    })

    const context = await buildSafeChatContext({
      sessionUser: { id: "real-user", email: "real@example.com" },
      clientBody: { orderId: "order-1", message: "物流", sessionId: "session-1" },
      findOrder,
    })

    expect(findOrder).toHaveBeenCalledWith("order-1", { id: "real-user", email: "real@example.com" })
    expect(context.order_id).toBe("order-1")
    expect(context.order_status).toBe("SHIPPED")
    expect(context.tracking_number).toBe("SF123")
  })

  it("does not expose order context for guests", async () => {
    const findOrder = jest.fn()

    const context = await buildSafeChatContext({
      sessionUser: null,
      clientBody: { orderId: "order-1", message: "查订单", sessionId: "session-1" },
      findOrder,
    })

    expect(findOrder).not.toHaveBeenCalled()
    expect(context.is_logged_in).toBe(false)
    expect(context.order_id).toBeUndefined()
  })

  it("redacts fields outside the safe allowlist", () => {
    const redacted = redactChatContext({
      tenant_id: "solo-sales",
      user_id: "user-1",
      order_id: "order-1",
      api_key: "secret",
      payment_card: "4111111111111111",
      access_token: "token",
    })

    expect(redacted).toEqual({
      tenant_id: "solo-sales",
      user_id: "user-1",
      order_id: "order-1",
    })
  })

  it("falls back when Python customer service is unavailable", async () => {
    const fetcher = jest.fn().mockRejectedValue(new Error("ECONNREFUSED"))

    const result = await callAiCustomerService({
      message: "你好",
      tenantId: "solo-sales",
      context: {},
      locale: "zh-CN",
      config: {
        enabled: true,
        baseUrl: "http://127.0.0.1:8001",
        serviceToken: "service-token",
        hmacSecret: "hmac-secret",
        timeoutMs: 1000,
      },
      fetcher,
    })

    expect(result.fallback).toBe(true)
    expect(result.data.answer).toContain("暂时无法连接智能客服")
    expect(result.data.llm_used).toBe(false)
  })

  it("sends standard payload to Python customer service", async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          answer: "您好",
          answer_mode: "rule",
          llm_used: false,
          intent: "greeting",
        },
      }),
    })

    const result = await callAiCustomerService({
      message: "你好",
      tenantId: "solo-sales",
      context: { user_id: "user-1" },
      locale: "zh-CN",
      config: {
        enabled: true,
        baseUrl: "http://127.0.0.1:8001",
        serviceToken: "service-token",
        hmacSecret: "hmac-secret",
        timeoutMs: 1000,
      },
      fetcher,
    })

    expect(result.fallback).toBe(false)
    expect(fetcher).toHaveBeenCalledWith(
      "http://127.0.0.1:8001/v1/chat",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer service-token",
          "Content-Type": "application/json",
          "X-CustomerService-Timestamp": expect.any(String),
          "X-CustomerService-Signature": expect.any(String),
        }),
        body: JSON.stringify({
          tenant_id: "solo-sales",
          message: "你好",
          context: { user_id: "user-1" },
          locale: "zh-CN",
        }),
      })
    )
    expect(result.data.answer).toBe("您好")
  })
})