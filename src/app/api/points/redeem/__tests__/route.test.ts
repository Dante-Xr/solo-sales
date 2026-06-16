import { POST } from "../route"

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

jest.mock("@/server/services/promotion-service", () => ({
  parseRedeemPointsInput: jest.fn(),
  redeemPoints: jest.fn(),
}))

const { requireAdminPermission } = jest.requireMock("@/server/services/admin-service") as {
  requireAdminPermission: jest.Mock
}
const { parseRedeemPointsInput, redeemPoints } = jest.requireMock("@/server/services/promotion-service") as {
  parseRedeemPointsInput: jest.Mock
  redeemPoints: jest.Mock
}
const { unauthorized } = jest.requireActual("@/server/contracts/errors") as typeof import("@/server/contracts/errors")

describe("/api/points/redeem route", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("requires admin points update permission before parsing the body", async () => {
    requireAdminPermission.mockRejectedValue(unauthorized("未登录"))
    const request = {
      headers: new Headers(),
      json: async () => ({ userId: "user_1", points: 100 }),
    }

    const response = await POST(request as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(requireAdminPermission).toHaveBeenCalledWith(request, "points.update")
    expect(parseRedeemPointsInput).not.toHaveBeenCalled()
    expect(redeemPoints).not.toHaveBeenCalled()
  })
})
