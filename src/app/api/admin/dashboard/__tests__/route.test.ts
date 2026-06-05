/**
 * 修改时间：2026-06-05 00:36:49 +08:00
 * 修改内容：新增后台仪表盘缓存契约测试，覆盖缓存命中跳过数据库和缓存未命中写回。
 * 修改模型：gpt-5.5
 */
jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}))

import { Prisma } from "@prisma/client"
import { GET } from "../route"

jest.mock("@/lib/cache", () => ({
  CACHE_KEYS: {
    ADMIN_DASHBOARD: () => "solo:admin:dashboard",
  },
  CACHE_TTL: {
    MEDIUM: 300,
  },
  cacheGet: jest.fn().mockResolvedValue(null),
  cacheSet: jest.fn().mockResolvedValue(true),
}))

jest.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findMany: jest.fn(),
    },
    product: {
      count: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
  },
}))

const { cacheGet, cacheSet } = jest.requireMock("@/lib/cache") as {
  cacheGet: jest.Mock
  cacheSet: jest.Mock
}

const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: {
    order: {
      findMany: jest.Mock
    }
    product: {
      count: jest.Mock
    }
    user: {
      count: jest.Mock
    }
  }
}

describe("/api/admin/dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    cacheGet.mockResolvedValue(null)
    cacheSet.mockResolvedValue(true)
    prisma.order.findMany
      .mockResolvedValueOnce([
        {
          totalAmount: new Prisma.Decimal(10),
          status: "PAID",
          createdAt: new Date("2026-06-01T00:00:00.000Z"),
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "order_1",
          totalAmount: new Prisma.Decimal(10),
          status: "PAID",
          createdAt: new Date("2026-06-01T00:00:00.000Z"),
          user: { name: "Buyer", email: "buyer@example.com" },
        },
      ])
    prisma.product.count.mockResolvedValue(3)
    prisma.user.count.mockResolvedValue(2)
  })

  it("returns cached dashboard data without hitting Prisma", async () => {
    cacheGet.mockResolvedValueOnce({
      stats: {
        totalRevenue: 10,
        revenueChange: 0,
        totalOrders: 1,
        ordersChange: 0,
        activeProducts: 3,
        productsChange: 0,
        activeUsers: 2,
        usersChange: 0,
      },
      recentOrders: [],
      chartData: [],
    })

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.meta).toEqual({ fromCache: true })
    expect(prisma.order.findMany).not.toHaveBeenCalled()
    expect(prisma.product.count).not.toHaveBeenCalled()
    expect(prisma.user.count).not.toHaveBeenCalled()
  })

  it("writes dashboard data to cache after database aggregation", async () => {
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(cacheSet).toHaveBeenCalledWith(
      "solo:admin:dashboard",
      expect.objectContaining({
        stats: expect.objectContaining({
          totalRevenue: 10,
          totalOrders: 1,
          activeProducts: 3,
          activeUsers: 2,
        }),
      }),
      300
    )
  })
})
