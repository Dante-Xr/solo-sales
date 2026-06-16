import { POST } from "../route"
import { prisma } from "@/lib/prisma"

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

jest.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn(),
    knowledgeBase: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

jest.mock("@/lib/cache", () => ({
  CACHE_TTL: { MEDIUM: 300 },
  cacheDelPattern: jest.fn(),
  cacheGet: jest.fn(),
  cacheSet: jest.fn(),
}))

jest.mock("@/server/services/admin-service", () => ({
  requireAdminPermission: jest.fn(),
}))

const { requireAdminPermission } = jest.requireMock("@/server/services/admin-service") as {
  requireAdminPermission: jest.Mock
}
const { unauthorized } = jest.requireActual("@/server/contracts/errors") as typeof import("@/server/contracts/errors")

describe("/api/knowledge route", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("rejects unauthenticated knowledge creation before writing to the database", async () => {
    requireAdminPermission.mockRejectedValue(unauthorized("未登录"))
    const request = {
      headers: new Headers(),
      json: async () => ({
        title: "Unsafe Knowledge",
        content: "content",
        category: "general",
        createdBy: "anonymous",
      }),
    }

    const response = await POST(request as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(requireAdminPermission).toHaveBeenCalledWith(request, "knowledge.create")
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })
})
