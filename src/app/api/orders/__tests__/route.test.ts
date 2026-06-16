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

jest.mock("@/middleware/csrf-guard", () => ({
  csrfGuard: jest.fn(),
}))

jest.mock("@/server/auth/session", () => ({
  getServerSessionUser: jest.fn(),
}))

jest.mock("@/server/services/order-service", () => ({
  createOrder: jest.fn(),
  getOrderByIdForViewer: jest.fn(),
  listOrdersForUser: jest.fn(),
  parseCreateOrderInput: jest.fn(),
}))

import { POST } from "../route"

const { csrfGuard } = jest.requireMock("@/middleware/csrf-guard") as {
  csrfGuard: jest.Mock
}
const { getServerSessionUser } = jest.requireMock("@/server/auth/session") as {
  getServerSessionUser: jest.Mock
}
const {
  createOrder,
  parseCreateOrderInput,
} = jest.requireMock("@/server/services/order-service") as {
  createOrder: jest.Mock
  parseCreateOrderInput: jest.Mock
}

describe("/api/orders route", () => {
  beforeEach(() => {
    jest.resetAllMocks()
    csrfGuard.mockResolvedValue(null)
  })

  it("rejects anonymous order creation before parsing the request body", async () => {
    getServerSessionUser.mockResolvedValue(null)
    const request = {
      headers: new Headers(),
      json: jest.fn(async () => ({
        items: [{ productId: "prod_1", quantity: 1 }],
        shippingAddress: "123 Main St",
      })),
    }

    const response = await POST(request as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(request.json).not.toHaveBeenCalled()
    expect(parseCreateOrderInput).not.toHaveBeenCalled()
    expect(createOrder).not.toHaveBeenCalled()
  })
})
