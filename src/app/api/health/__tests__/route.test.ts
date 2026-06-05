/**
 * 修改时间：2026-06-04 16:28:48 +08:00
 * 修改内容：新增健康检查故障契约测试，覆盖数据库不可达和 Redis 不可达时的标准健康检查响应。
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

import { GET } from "../route"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}))

jest.mock("@/lib/redis", () => ({
  __esModule: true,
  default: {
    ping: jest.fn(),
  },
}))

const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: {
    $queryRaw: jest.Mock
  }
}

const redis = jest.requireMock("@/lib/redis").default as {
  ping: jest.Mock
}

describe("/api/health", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    prisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }])
    redis.ping.mockResolvedValue("PONG")
  })

  it("returns 503 and marks database unhealthy when database is unavailable", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined)
    prisma.$queryRaw.mockRejectedValueOnce({
      code: "P1001",
      message: "Can't reach database server",
    })

    try {
      const response = await GET()
      const body = await response.json()

      expect(response.status).toBe(503)
      expect(body.success).toBe(true)
      expect(body.status).toBe("unhealthy")
      expect(body.data.checks.database).toMatchObject({
        status: "error",
        error: "数据库连接暂时不可用，请稍后重试",
      })
      expect(body.data.checks.redis.status).toBe("ok")
    } finally {
      warnSpy.mockRestore()
    }
  })

  it("keeps the health endpoint available and marks Redis degraded when Redis is unavailable", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined)
    redis.ping.mockRejectedValueOnce(new Error("fetch failed"))

    try {
      const response = await GET()
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.status).toBe("healthy")
      expect(body.data.checks.database.status).toBe("ok")
      expect(body.data.checks.redis).toMatchObject({
        status: "error",
        error: "缓存服务暂时不可用，请稍后重试",
      })
    } finally {
      warnSpy.mockRestore()
    }
  })
})
