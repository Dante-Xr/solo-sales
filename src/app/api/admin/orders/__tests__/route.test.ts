jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
  NextRequest: class {},
}))

jest.mock("@/server/services/admin-service", () => ({
  requireAdminPermission: jest.fn(),
}))

jest.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}))

import { GET, PATCH } from "../route"

const { requireAdminPermission } = jest.requireMock("@/server/services/admin-service") as {
  requireAdminPermission: jest.Mock
}

const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: {
    order: {
      findMany: jest.Mock
      update: jest.Mock
    }
  }
}

const { unauthorized, forbidden } = jest.requireActual("@/server/contracts/errors") as typeof import("@/server/contracts/errors")

describe("/api/admin/orders", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    requireAdminPermission.mockRejectedValue(unauthorized("未登录"))
    prisma.order.findMany.mockResolvedValue([])
    prisma.order.update.mockResolvedValue({ id: "order_1", status: "SHIPPED" })
  })

  it("rejects unauthenticated order list access before querying orders", async () => {
    const response = await GET({ headers: new Headers() } as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(prisma.order.findMany).not.toHaveBeenCalled()
  })

  it("rejects unauthenticated order updates before mutating orders", async () => {
    const request = {
      headers: new Headers(),
      json: async () => ({
        orderId: "order_1",
        status: "SHIPPED",
        trackingNumber: "TRACK123",
      }),
    } as never

    const response = await PATCH(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("rejects order update when admin lacks orders.update permission", async () => {
    requireAdminPermission.mockRejectedValue(forbidden("无 orders.update 权限"))

    const request = {
      headers: new Headers(),
      json: async () => ({
        orderId: "order_1",
        status: "SHIPPED",
        trackingNumber: "TRACK123",
      }),
    } as never

    const response = await PATCH(request)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.success).toBe(false)
    expect(prisma.order.update).not.toHaveBeenCalled()
  })
})
