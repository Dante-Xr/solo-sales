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

jest.mock("@/lib/rag/ConversationManager", () => ({
  getConversationManager: jest.fn(),
}))

jest.mock("@/lib/prisma", () => ({
  prisma: {
    conversation: {
      findUnique: jest.fn(),
    },
  },
}))

import { DELETE, POST } from "../route"

const { getServerSessionUser } = jest.requireMock("@/server/auth/session") as {
  getServerSessionUser: jest.Mock
}

const { getConversationManager } = jest.requireMock("@/lib/rag/ConversationManager") as {
  getConversationManager: jest.Mock
}

const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: {
    conversation: {
      findUnique: jest.Mock
    }
  }
}

describe("/api/chat/feedback route", () => {
  const conversationManager = {
    submitFeedback: jest.fn(),
    clearHistory: jest.fn(),
  }

  beforeEach(() => {
    jest.resetAllMocks()
    getConversationManager.mockReturnValue(conversationManager)
  })

  it("rejects anonymous feedback before parsing the body", async () => {
    getServerSessionUser.mockResolvedValue(null)
    const request = {
      json: jest.fn(async () => ({
        sessionId: "session_1",
        rating: "satisfied",
      })),
    }

    const response = await POST(request as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(request.json).not.toHaveBeenCalled()
    expect(conversationManager.submitFeedback).not.toHaveBeenCalled()
  })

  it("rejects feedback for conversations owned by another user", async () => {
    getServerSessionUser.mockResolvedValue({ id: "user_attacker" })
    prisma.conversation.findUnique.mockResolvedValue({ id: "session_1", userId: "user_owner" })
    const request = {
      json: jest.fn(async () => ({
        sessionId: "session_1",
        rating: "satisfied",
      })),
    }

    const response = await POST(request as never)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.success).toBe(false)
    expect(conversationManager.submitFeedback).not.toHaveBeenCalled()
  })

  it("submits feedback only for the current user's conversation", async () => {
    getServerSessionUser.mockResolvedValue({ id: "user_owner" })
    prisma.conversation.findUnique.mockResolvedValue({ id: "session_1", userId: "user_owner" })
    const request = {
      json: jest.fn(async () => ({
        sessionId: "session_1",
        rating: "satisfied",
        comment: "Helpful",
      })),
    }

    const response = await POST(request as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(conversationManager.submitFeedback).toHaveBeenCalledWith(
      "session_1",
      "SATISFIED",
      "Helpful"
    )
  })

  it("rejects anonymous history deletion before clearing history", async () => {
    getServerSessionUser.mockResolvedValue(null)
    const request = {
      nextUrl: { searchParams: new URLSearchParams("sessionId=session_1") },
    }

    const response = await DELETE(request as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(conversationManager.clearHistory).not.toHaveBeenCalled()
  })

  it("rejects history deletion for conversations owned by another user", async () => {
    getServerSessionUser.mockResolvedValue({ id: "user_attacker" })
    prisma.conversation.findUnique.mockResolvedValue({ id: "session_1", userId: "user_owner" })
    const request = {
      nextUrl: { searchParams: new URLSearchParams("sessionId=session_1") },
    }

    const response = await DELETE(request as never)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.success).toBe(false)
    expect(conversationManager.clearHistory).not.toHaveBeenCalled()
  })
})
