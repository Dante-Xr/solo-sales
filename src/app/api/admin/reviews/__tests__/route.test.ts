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

jest.mock("@/server/services/admin-service", () => ({
  requireAdminPermission: jest.fn(),
}))

jest.mock("@/lib/prisma", () => ({
  prisma: {
    review: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    reviewReply: {
      create: jest.fn(),
    },
  },
}))

import { POST } from "../route"

const { requireAdminPermission } = jest.requireMock("@/server/services/admin-service") as {
  requireAdminPermission: jest.Mock
}

const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: {
    review: {
      findUnique: jest.Mock
      update: jest.Mock
      delete: jest.Mock
      deleteMany: jest.Mock
      updateMany: jest.Mock
      findMany: jest.Mock
      count: jest.Mock
    }
    reviewReply: {
      create: jest.Mock
    }
  }
}

describe("/api/admin/reviews route", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("creates merchant replies with the authenticated admin identity", async () => {
    requireAdminPermission.mockResolvedValue({ id: "admin_1" })
    prisma.review.findUnique.mockResolvedValue({ id: "review_1" })
    prisma.reviewReply.create.mockResolvedValue({ id: "reply_1" })
    const request = {
      headers: new Headers(),
      json: jest.fn(async () => ({
        action: "reply",
        reviewId: "review_1",
        content: " Thanks for your review. ",
        adminId: "spoofed_admin",
      })),
    }

    const response = await POST(request as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(requireAdminPermission).toHaveBeenCalledWith(request, "reviews.update")
    expect(prisma.reviewReply.create).toHaveBeenCalledWith({
      data: {
        reviewId: "review_1",
        content: "Thanks for your review.",
        userId: null,
        adminId: "admin_1",
      },
    })
  })
})
