import { POST } from "../route"

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      headers: { set: jest.fn() },
      json: async () => body,
    }),
  },
}))

jest.mock("@/middleware/csrf-guard", () => ({
  csrfGuard: jest.fn(),
}))

jest.mock("@/middleware/rate-limit", () => ({
  paymentRateLimiter: jest.fn(),
}))

jest.mock("@/server/auth/session", () => ({
  getServerSessionUser: jest.fn(),
}))

jest.mock("@/server/services/payment-service", () => ({
  createStripeCheckoutSession: jest.fn(),
}))

const { csrfGuard } = jest.requireMock("@/middleware/csrf-guard") as {
  csrfGuard: jest.Mock
}
const { paymentRateLimiter } = jest.requireMock("@/middleware/rate-limit") as {
  paymentRateLimiter: jest.Mock
}
const { getServerSessionUser } = jest.requireMock("@/server/auth/session") as {
  getServerSessionUser: jest.Mock
}
const { createStripeCheckoutSession } = jest.requireMock("@/server/services/payment-service") as {
  createStripeCheckoutSession: jest.Mock
}

describe("/api/checkout/stripe route", () => {
  beforeEach(() => {
    jest.resetAllMocks()
    csrfGuard.mockResolvedValue(null)
    paymentRateLimiter.mockReturnValue({ allowed: true })
  })

  it("rejects anonymous checkout before parsing the body or creating a Stripe session", async () => {
    getServerSessionUser.mockResolvedValue(null)
    const request = {
      headers: new Headers(),
      json: jest.fn(async () => ({ productId: "prod_1", quantity: 1 })),
    }

    const response = await POST(request as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(request.json).not.toHaveBeenCalled()
    expect(createStripeCheckoutSession).not.toHaveBeenCalled()
  })
})
