import { GET, POST } from "../route"

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

jest.mock("@/server/services/admin-service", () => ({
  requireAdminPermission: jest.fn(),
}))

jest.mock("@/server/services/promotion-service", () => ({
  createPointsAccount: jest.fn(),
  getPointsInfo: jest.fn(),
  parsePointsQuery: jest.fn(),
}))

const { getServerSessionUser } = jest.requireMock("@/server/auth/session") as {
  getServerSessionUser: jest.Mock
}
const { requireAdminPermission } = jest.requireMock("@/server/services/admin-service") as {
  requireAdminPermission: jest.Mock
}
const { createPointsAccount, getPointsInfo, parsePointsQuery } = jest.requireMock(
  "@/server/services/promotion-service"
) as {
  createPointsAccount: jest.Mock
  getPointsInfo: jest.Mock
  parsePointsQuery: jest.Mock
}
const { unauthorized } = jest.requireActual("@/server/contracts/errors") as typeof import("@/server/contracts/errors")

describe("/api/points route", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("rejects anonymous points balance reads before parsing the query", async () => {
    getServerSessionUser.mockResolvedValue(null)
    const request = {
      nextUrl: { searchParams: new URLSearchParams("userId=user_1") },
    }

    const response = await GET(request as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(parsePointsQuery).not.toHaveBeenCalled()
    expect(getPointsInfo).not.toHaveBeenCalled()
  })

  it("rejects points balance IDOR before loading the account", async () => {
    getServerSessionUser.mockResolvedValue({ id: "user_1" })
    parsePointsQuery.mockReturnValue({ userId: "user_2" })
    const request = {
      nextUrl: { searchParams: new URLSearchParams("userId=user_2") },
    }

    const response = await GET(request as never)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.success).toBe(false)
    expect(getPointsInfo).not.toHaveBeenCalled()
  })

  it("requires admin points update permission before creating a points account", async () => {
    requireAdminPermission.mockRejectedValue(unauthorized("未登录"))
    const request = {
      headers: new Headers(),
      json: async () => ({ action: "create", userId: "user_1" }),
    }

    const response = await POST(request as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(requireAdminPermission).toHaveBeenCalledWith(request, "points.update")
    expect(createPointsAccount).not.toHaveBeenCalled()
  })
})
