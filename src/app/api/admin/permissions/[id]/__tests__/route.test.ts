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

import { GET, PATCH, DELETE } from "../route"

const { requireAdminPermission } = jest.requireMock("@/server/services/admin-service") as {
  requireAdminPermission: jest.Mock
}

const { unauthorized } = jest.requireActual("@/server/contracts/errors") as typeof import("@/server/contracts/errors")

describe("/api/admin/permissions/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    requireAdminPermission.mockRejectedValue(unauthorized("未登录"))
  })

  it("rejects unauthenticated permission detail access", async () => {
    const response = await GET(
      { headers: new Headers() } as never,
      { params: Promise.resolve({ id: "perm_1" }) } as never
    )
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
  })

  it("rejects unauthenticated permission updates", async () => {
    const request = {
      headers: new Headers(),
      json: async () => ({ name: "Updated Permission" }),
    } as never

    const response = await PATCH(request, { params: Promise.resolve({ id: "perm_1" }) } as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
  })

  it("rejects unauthenticated permission deletion", async () => {
    const response = await DELETE(
      { headers: new Headers() } as never,
      { params: Promise.resolve({ id: "perm_1" }) } as never
    )
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
  })
})
