jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}))

jest.mock("@/middleware/rate-limit", () => ({
  paymentRateLimiter: jest.fn(() => ({
    allowed: true,
    headers: {},
  })),
}))

import { POST } from "../route"

describe("/api/checkout/paypal", () => {
  const originalNodeEnv = process.env.NODE_ENV
  const originalVercelEnv = process.env.VERCEL_ENV

  afterEach(() => {
    Object.defineProperty(process.env, "NODE_ENV", { value: originalNodeEnv, configurable: true })
    if (originalVercelEnv === undefined) {
      delete process.env.VERCEL_ENV
    } else {
      process.env.VERCEL_ENV = originalVercelEnv
    }
    jest.clearAllMocks()
  })

  it("rejects production PayPal checkout instead of returning a mock order", async () => {
    process.env.VERCEL_ENV = "production"

    const response = await POST()
    const body = await response.json()

    expect(response.status).toBe(501)
    expect(body.success).toBe(false)
    expect(JSON.stringify(body)).not.toContain("PAYPAL-MOCK")
  })

  it("rejects PayPal checkout in non-production instead of trusting client supplied amounts", async () => {
    const response = await POST()
    const body = await response.json()

    expect(response.status).toBe(501)
    expect(body.success).toBe(false)
    expect(JSON.stringify(body)).not.toContain("PAYPAL-MOCK")
  })
})
