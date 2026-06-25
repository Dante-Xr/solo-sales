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

import { GET, POST } from "../route"

const { requireAdminPermission } = jest.requireMock("@/server/services/admin-service") as {
  requireAdminPermission: jest.Mock
}

const { unauthorized } = jest.requireActual("@/server/contracts/errors") as typeof import("@/server/contracts/errors")

describe("/api/admin/users", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    requireAdminPermission.mockRejectedValue(unauthorized("未登录"))
  })

  it("rejects unauthenticated user list access before querying users", async () => {
    const response = await GET({ headers: new Headers() } as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
  })

  it("rejects unauthenticated user creation before creating users", async () => {
    const request = {
      headers: new Headers(),
      json: async () => ({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        roleIds: [],
      }),
    } as never

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
  })
})
