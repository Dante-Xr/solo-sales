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
      update: jest.fn(),
      delete: jest.fn(),
    },
    reviewImage: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
  },
}))

import { DELETE, PUT } from "../route"

const { getServerSessionUser } = jest.requireMock("@/server/auth/session") as {
  getServerSessionUser: jest.Mock
}

const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: {
    review: {
      findUnique: jest.Mock
      update: jest.Mock
      delete: jest.Mock
    }
    reviewImage: {
      deleteMany: jest.Mock
      createMany: jest.Mock
    }
  }
}

describe("/api/reviews/[id] route", () => {
  const params = { params: Promise.resolve({ id: "review_1" }) }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("rejects anonymous review updates before parsing the body", async () => {
    getServerSessionUser.mockResolvedValue(null)
    const request = {
      json: jest.fn(async () => ({ rating: 5 })),
    }

    const response = await PUT(request as never, params)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(request.json).not.toHaveBeenCalled()
    expect(prisma.review.update).not.toHaveBeenCalled()
  })

  it("rejects updates from users who do not own the review", async () => {
    getServerSessionUser.mockResolvedValue({ id: "user_attacker" })
    prisma.review.findUnique.mockResolvedValue({ id: "review_1", userId: "user_owner" })
    const request = {
      json: jest.fn(async () => ({ rating: 5 })),
    }

    const response = await PUT(request as never, params)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.success).toBe(false)
    expect(prisma.review.update).not.toHaveBeenCalled()
  })

  it("allows the review owner to update their review", async () => {
    getServerSessionUser.mockResolvedValue({ id: "user_owner" })
    prisma.review.findUnique.mockResolvedValue({ id: "review_1", userId: "user_owner" })
    prisma.review.update.mockResolvedValue({ id: "review_1", rating: 4 })
    const request = {
      json: jest.fn(async () => ({ rating: 4 })),
    }

    const response = await PUT(request as never, params)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(prisma.review.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "review_1" },
        data: { rating: 4 },
      })
    )
  })

  it("rejects anonymous review deletes before querying the review", async () => {
    getServerSessionUser.mockResolvedValue(null)

    const response = await DELETE({} as never, params)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(prisma.review.findUnique).not.toHaveBeenCalled()
    expect(prisma.review.delete).not.toHaveBeenCalled()
  })

  it("rejects deletes from users who do not own the review", async () => {
    getServerSessionUser.mockResolvedValue({ id: "user_attacker" })
    prisma.review.findUnique.mockResolvedValue({ id: "review_1", userId: "user_owner" })

    const response = await DELETE({} as never, params)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.success).toBe(false)
    expect(prisma.review.delete).not.toHaveBeenCalled()
  })
})
