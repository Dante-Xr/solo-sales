jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
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
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

import { GET } from "../route"

const { requireAdminPermission } = jest.requireMock("@/server/services/admin-service") as {
  requireAdminPermission: jest.Mock
}

const { unauthorized } = jest.requireActual("@/server/contracts/errors") as typeof import("@/server/contracts/errors")

describe("/api/customers", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    requireAdminPermission.mockRejectedValue(unauthorized("未登录"))
  })

  it("rejects unauthenticated customer list access", async () => {
    const request = {
      headers: new Headers(),
      url: "http://localhost/api/customers",
    }

    const response = await GET(request as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
  })
})
