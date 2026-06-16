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

jest.mock("@/lib/currency/CurrencyService", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    updateExchangeRates: jest.fn().mockResolvedValue(true),
  })),
}))

jest.mock("@/lib/prisma", () => ({
  prisma: {},
}))

import { POST } from "../route"

const { requireAdminPermission } = jest.requireMock("@/server/services/admin-service") as {
  requireAdminPermission: jest.Mock
}

const CurrencyService = jest.requireMock("@/lib/currency/CurrencyService").default as jest.Mock
const { unauthorized } = jest.requireActual("@/server/contracts/errors") as typeof import("@/server/contracts/errors")

describe("/api/currency/rates route", () => {
  const originalExchangeRateApiKey = process.env.EXCHANGE_RATE_API_KEY

  beforeEach(() => {
    jest.clearAllMocks()
    CurrencyService.mockImplementation(() => ({
      updateExchangeRates: jest.fn().mockResolvedValue(true),
    }))
    process.env.EXCHANGE_RATE_API_KEY = "server_exchange_key"
  })

  afterAll(() => {
    if (originalExchangeRateApiKey === undefined) {
      delete process.env.EXCHANGE_RATE_API_KEY
    } else {
      process.env.EXCHANGE_RATE_API_KEY = originalExchangeRateApiKey
    }
  })

  it("rejects unauthenticated refreshes before using caller supplied API keys", async () => {
    requireAdminPermission.mockRejectedValue(unauthorized("未登录"))
    const request = {
      headers: new Headers({ "x-exchange-api-key": "attacker_key" }),
    }

    const response = await POST(request as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(requireAdminPermission).toHaveBeenCalledWith(request, "currency.update")
    expect(CurrencyService).not.toHaveBeenCalled()
  })

  it("uses the server configured exchange API key instead of the request header", async () => {
    requireAdminPermission.mockResolvedValue({ id: "admin_1" })
    const request = {
      headers: new Headers({ "x-exchange-api-key": "attacker_key" }),
    }

    const response = await POST(request as never)
    const body = await response.json()
    const serviceInstance = CurrencyService.mock.results[0].value

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(serviceInstance.updateExchangeRates).toHaveBeenCalledWith("server_exchange_key")
    expect(serviceInstance.updateExchangeRates).not.toHaveBeenCalledWith("attacker_key")
  })
})
