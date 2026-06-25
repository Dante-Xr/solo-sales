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

import { GET } from "../route"

const { requireAdminPermission } = jest.requireMock("@/server/services/admin-service") as {
  requireAdminPermission: jest.Mock
}

const { unauthorized } = jest.requireActual("@/server/contracts/errors") as typeof import("@/server/contracts/errors")

describe("/api/customers/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    requireAdminPermission.mockRejectedValue(unauthorized("未登录"))
  })

  it("rejects unauthenticated customer detail access", async () => {
    const response = await GET(
      { headers: new Headers() } as never,
      { params: Promise.resolve({ id: "customer_1" }) } as never
    )
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
  })
})
