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

describe("/api/admin/permissions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    requireAdminPermission.mockRejectedValue(unauthorized("未登录"))
  })

  it("rejects unauthenticated permission list access", async () => {
    const response = await GET({ headers: new Headers() } as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
  })

  it("rejects unauthenticated permission creation", async () => {
    const request = {
      headers: new Headers(),
      json: async () => ({
        code: "products.export",
        name: "导出商品",
        group: "商品管理",
      }),
    } as never

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
  })
})
