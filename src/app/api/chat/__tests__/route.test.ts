jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      headers: { set: jest.fn() },
      json: async () => body,
    }),
  },
  NextRequest: class {},
}))

jest.mock("@/server/auth/session", () => ({
  getServerSessionUser: jest.fn(),
}))

jest.mock("@/server/config/ai-customer", () => ({
  getAiCustomerConfig: jest.fn(),
}))

jest.mock("@/server/services/ai-customer-client", () => ({
  callAiCustomerService: jest.fn(),
}))

jest.mock("@/server/services/chat-context-service", () => ({
  buildSafeChatContext: jest.fn(),
}))

jest.mock("@/lib/rag/ConversationManager", () => ({
  getConversationManager: jest.fn(),
}))

jest.mock("@/lib/prisma", () => ({
  prisma: {
    conversation: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

import { POST } from "../route"

const { getServerSessionUser } = jest.requireMock("@/server/auth/session") as {
  getServerSessionUser: jest.Mock
}

const { getAiCustomerConfig } = jest.requireMock("@/server/config/ai-customer") as {
  getAiCustomerConfig: jest.Mock
}

const { callAiCustomerService } = jest.requireMock("@/server/services/ai-customer-client") as {
  callAiCustomerService: jest.Mock
}

const { buildSafeChatContext } = jest.requireMock("@/server/services/chat-context-service") as {
  buildSafeChatContext: jest.Mock
}

const { getConversationManager } = jest.requireMock("@/lib/rag/ConversationManager") as {
  getConversationManager: jest.Mock
}

const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: {
    conversation: {
      findUnique: jest.Mock
      update: jest.Mock
    }
  }
}

describe("/api/chat route", () => {
  const conversationManager = {
    getOrCreateContext: jest.fn(),
  }

  beforeEach(() => {
    jest.resetAllMocks()
    getConversationManager.mockReturnValue(conversationManager)
    prisma.conversation.findUnique.mockResolvedValue(null)
    prisma.conversation.update.mockResolvedValue({})
    getAiCustomerConfig.mockReturnValue({
      tenantId: "tenant_1",
      locale: "en",
    })
    buildSafeChatContext.mockResolvedValue({ userId: "user_1" })
    callAiCustomerService.mockResolvedValue({
      fallback: false,
      data: {
        answer: "Hello",
        intent: "general",
        answer_mode: "general",
        knowledge_sources: [],
        llm_used: true,
      },
    })
  })

  it("binds a logged-in chat session to the current user before calling AI service", async () => {
    getServerSessionUser.mockResolvedValue({ id: "user_1", email: "buyer@example.com" })
    const request = {
      json: jest.fn(async () => ({
        sessionId: "session_1",
        message: "hello",
        userId: "attacker",
      })),
    }

    const response = await POST(request as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(conversationManager.getOrCreateContext).toHaveBeenCalledWith("session_1", "user_1")
    expect(callAiCustomerService).toHaveBeenCalled()
  })

  it("rejects a logged-in user reusing another user's chat session", async () => {
    getServerSessionUser.mockResolvedValue({ id: "user_attacker", email: "attacker@example.com" })
    prisma.conversation.findUnique.mockResolvedValue({ id: "session_1", userId: "user_owner" })
    const request = {
      json: jest.fn(async () => ({
        sessionId: "session_1",
        message: "hello",
      })),
    }

    const response = await POST(request as never)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.success).toBe(false)
    expect(conversationManager.getOrCreateContext).not.toHaveBeenCalled()
    expect(callAiCustomerService).not.toHaveBeenCalled()
  })

  it("claims an anonymous existing chat session for the current user", async () => {
    getServerSessionUser.mockResolvedValue({ id: "user_1", email: "buyer@example.com" })
    prisma.conversation.findUnique.mockResolvedValue({ id: "session_1", userId: null })
    const request = {
      json: jest.fn(async () => ({
        sessionId: "session_1",
        message: "hello",
      })),
    }

    const response = await POST(request as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(prisma.conversation.update).toHaveBeenCalledWith({
      where: { id: "session_1" },
      data: { userId: "user_1" },
    })
    expect(conversationManager.getOrCreateContext).toHaveBeenCalledWith("session_1", "user_1")
  })
})
