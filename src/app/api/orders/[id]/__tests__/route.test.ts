import { GET } from "../route"
import { getOrderByIdForViewer } from "@/server/services/order-service"

jest.mock("@/server/services/order-service")
jest.mock("@/server/auth/session", () => ({
  getServerSessionUser: jest.fn(),
}))
jest.mock("next/server", () => {
  const json = jest.fn((body: unknown) => ({
    status: 200,
    json: async () => body,
  }))
  return { NextResponse: { json } }
})

import { getServerSessionUser } from "@/server/auth/session"

describe("GET /api/orders/[id]", () => {
  const mockGetOrderById = getOrderByIdForViewer as jest.Mock
  const mockGetSession = getServerSessionUser as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("rejects unauthenticated access with 401", async () => {
    mockGetSession.mockResolvedValue(null)
    mockGetOrderById.mockRejectedValue(
      Object.assign(new Error("Unauthorized"), { statusCode: 401 })
    )

    const response = await GET(
      {} as Request,
      { params: Promise.resolve({ id: "ord_123" }) }
    )

    const body = await response.json()
    expect(body.error).toBeTruthy()
  })

  it("rejects authenticated user accessing another user order (IDOR)", async () => {
    mockGetSession.mockResolvedValue({ id: "user-A" })
    mockGetOrderById.mockRejectedValue(
      Object.assign(new Error("Forbidden"), { statusCode: 403 })
    )

    const response = await GET(
      {} as Request,
      { params: Promise.resolve({ id: "ord_999" }) }
    )

    const body = await response.json()
    expect(body.error).toBeTruthy()
  })

  it("returns order for owner", async () => {
    const order = { id: "ord_123", userId: "user-A", status: "PAID" }
    mockGetSession.mockResolvedValue({ id: "user-A" })
    mockGetOrderById.mockResolvedValue(order)

    const response = await GET(
      {} as Request,
      { params: Promise.resolve({ id: "ord_123" }) }
    )

    const body = await response.json()
    expect(body.data.id).toBe("ord_123")
  })
})
