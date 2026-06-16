import { GET } from "../route"
import { getAnalyticsService } from "@/lib/analytics/AnalyticsService"

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

jest.mock("@/lib/analytics/AnalyticsService", () => ({
  getAnalyticsService: jest.fn(),
}))

jest.mock("@/server/services/admin-service", () => ({
  requireAdminPermission: jest.fn(),
}))

const { requireAdminPermission } = jest.requireMock("@/server/services/admin-service") as {
  requireAdminPermission: jest.Mock
}
const { unauthorized } = jest.requireActual("@/server/contracts/errors") as typeof import("@/server/contracts/errors")

describe("/api/analytics/overview route", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("rejects unauthenticated analytics reads before loading analytics data", async () => {
    requireAdminPermission.mockRejectedValue(unauthorized("未登录"))
    const request = {
      headers: new Headers(),
      nextUrl: { searchParams: new URLSearchParams("timeRange=30d") },
    }

    const response = await GET(request as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(requireAdminPermission).toHaveBeenCalledWith(request, "analytics.view")
    expect(getAnalyticsService).not.toHaveBeenCalled()
  })
})
