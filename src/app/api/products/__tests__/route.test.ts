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

jest.mock("@/server/services/product-service", () => ({
  createProductFromInput: jest.fn(),
  listProducts: jest.fn(),
  parseCreateProductInput: jest.fn(),
  parseListProductsQuery: jest.fn(),
}))

const { requireAdminPermission } = jest.requireMock("@/server/services/admin-service") as {
  requireAdminPermission: jest.Mock
}
const { parseCreateProductInput } = jest.requireMock("@/server/services/product-service") as {
  parseCreateProductInput: jest.Mock
}
const { unauthorized } = jest.requireActual("@/server/contracts/errors") as typeof import("@/server/contracts/errors")

describe("/api/products route", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("rejects unauthenticated product creation before parsing the body", async () => {
    requireAdminPermission.mockRejectedValue(unauthorized("未登录"))
    const request = {
      headers: new Headers(),
      json: async () => ({ name: "Unsafe Product" }),
    }

    const response = await POST(request as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(requireAdminPermission).toHaveBeenCalledWith(request, "products.create")
    expect(parseCreateProductInput).not.toHaveBeenCalled()
  })
})
