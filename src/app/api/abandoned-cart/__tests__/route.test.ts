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

jest.mock("@/server/services/admin-service", () => ({
  requireAdminPermission: jest.fn(),
}))

jest.mock("@/server/auth/session", () => ({
  getServerSessionUser: jest.fn(),
}))

jest.mock("@/lib/services/AbandonedCartService", () => ({
  checkAbandonedCarts: jest.fn(),
  recordAbandonedCart: jest.fn(),
}))

const { requireAdminPermission } = jest.requireMock("@/server/services/admin-service") as {
  requireAdminPermission: jest.Mock
}
const { getServerSessionUser } = jest.requireMock("@/server/auth/session") as {
  getServerSessionUser: jest.Mock
}
const { checkAbandonedCarts, recordAbandonedCart } = jest.requireMock(
  "@/lib/services/AbandonedCartService"
) as {
  checkAbandonedCarts: jest.Mock
  recordAbandonedCart: jest.Mock
}
const { unauthorized } = jest.requireActual("@/server/contracts/errors") as typeof import("@/server/contracts/errors")

describe("/api/abandoned-cart route", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("requires admin permission before manually checking abandoned carts", async () => {
    requireAdminPermission.mockRejectedValue(unauthorized("未登录"))
    const request = {
      headers: new Headers(),
      nextUrl: { searchParams: new URLSearchParams("action=check") },
    }

    const response = await GET(request as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(requireAdminPermission).toHaveBeenCalledWith(request, "abandonedCarts.update")
    expect(checkAbandonedCarts).not.toHaveBeenCalled()
  })

  it("rejects anonymous cart recording before parsing the body", async () => {
    getServerSessionUser.mockResolvedValue(null)
    const request = {
      json: jest.fn(async () => ({
        userId: "attacker",
        userEmail: "attacker@example.com",
        cartData: [],
        totalAmount: 10,
      })),
    }

    const response = await POST(request as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(request.json).not.toHaveBeenCalled()
    expect(recordAbandonedCart).not.toHaveBeenCalled()
  })

  it("records carts with the current session identity instead of trusting body identity", async () => {
    getServerSessionUser.mockResolvedValue({
      id: "user_1",
      email: "buyer@example.com",
      name: "Buyer",
    })
    recordAbandonedCart.mockResolvedValue("cart_1")
    const request = {
      json: jest.fn(async () => ({
        userId: "attacker",
        userEmail: "attacker@example.com",
        userName: "Attacker",
        cartData: [{ productId: "prod_1", name: "Product", price: 10, quantity: 1 }],
        totalAmount: 10,
        locale: "en",
      })),
    }

    const response = await POST(request as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(recordAbandonedCart).toHaveBeenCalledWith({
      userId: "user_1",
      userEmail: "buyer@example.com",
      userName: "Buyer",
      cartData: [{ productId: "prod_1", name: "Product", price: 10, quantity: 1 }],
      totalAmount: 10,
      locale: "en",
    })
  })
})
