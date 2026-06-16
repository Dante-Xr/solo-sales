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

jest.mock("@/lib/prisma", () => ({
  prisma: {
    review: {
      findUnique: jest.fn(),
    },
    reviewReply: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

import { DELETE, POST } from "../route"

const { getServerSessionUser } = jest.requireMock("@/server/auth/session") as {
  getServerSessionUser: jest.Mock
}

const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: {
    review: {
      findUnique: jest.Mock
    }
    reviewReply: {
      create: jest.Mock
      findUnique: jest.Mock
      delete: jest.Mock
    }
  }
}

describe("/api/reviews/[id]/replies route", () => {
  const params = { params: Promise.resolve({ id: "review_1" }) }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("rejects anonymous reply creation before parsing the body", async () => {
    getServerSessionUser.mockResolvedValue(null)
    const request = {
      json: jest.fn(async () => ({
        content: "spoof",
        userId: "attacker",
        adminId: "admin",
      })),
    }

    const response = await POST(request as never, params)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(request.json).not.toHaveBeenCalled()
    expect(prisma.reviewReply.create).not.toHaveBeenCalled()
  })

  it("creates replies with the current user identity instead of trusting body identity", async () => {
    getServerSessionUser.mockResolvedValue({ id: "user_owner" })
    prisma.review.findUnique.mockResolvedValue({ id: "review_1" })
    prisma.reviewReply.create.mockResolvedValue({ id: "reply_1", userId: "user_owner" })
    const request = {
      json: jest.fn(async () => ({
        content: "real reply",
        userId: "attacker",
        adminId: "admin",
      })),
    }

    const response = await POST(request as never, params)
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.success).toBe(true)
    expect(prisma.reviewReply.create).toHaveBeenCalledWith({
      data: {
        reviewId: "review_1",
        content: "real reply",
        userId: "user_owner",
        adminId: null,
      },
    })
  })

  it("rejects anonymous reply deletion before deleting", async () => {
    getServerSessionUser.mockResolvedValue(null)
    const request = {
      url: "https://example.com/api/reviews/review_1/replies?replyId=reply_1",
    }

    const response = await DELETE(request as never, params)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(prisma.reviewReply.delete).not.toHaveBeenCalled()
  })

  it("rejects reply deletion from users who do not own the reply", async () => {
    getServerSessionUser.mockResolvedValue({ id: "user_attacker" })
    prisma.reviewReply.findUnique.mockResolvedValue({
      id: "reply_1",
      reviewId: "review_1",
      userId: "user_owner",
    })
    const request = {
      url: "https://example.com/api/reviews/review_1/replies?replyId=reply_1",
    }

    const response = await DELETE(request as never, params)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.success).toBe(false)
    expect(prisma.reviewReply.delete).not.toHaveBeenCalled()
  })
})
