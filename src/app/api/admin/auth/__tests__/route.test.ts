jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      cookies: { set: jest.fn() },
      json: async () => body,
    }),
  },
  NextRequest: class {},
}))

jest.mock("next/headers", () => ({
  headers: jest.fn(),
}))

jest.mock("@/lib/prisma", () => ({
  prisma: {
    account: { findFirst: jest.fn() },
    adminUser: { findUnique: jest.fn(), update: jest.fn() },
    permissionLog: { create: jest.fn() },
    session: { create: jest.fn(), deleteMany: jest.fn() },
    user: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  },
}))

jest.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
      signInEmail: jest.fn(),
      signOut: jest.fn(),
      signUpEmail: jest.fn(),
    },
  },
}))

jest.mock("@/middleware/rate-limit", () => ({
  adminLoginRateLimiter: jest.fn(),
}))

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}))

import { POST } from "../route"
import { GET } from "../me/route"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { adminLoginRateLimiter } from "@/middleware/rate-limit"
import bcrypt from "bcryptjs"

const mockedPrisma = prisma as unknown as {
  account: { findFirst: jest.Mock }
  adminUser: { findUnique: jest.Mock; update: jest.Mock }
  permissionLog: { create: jest.Mock }
  session: { create: jest.Mock; deleteMany: jest.Mock }
  user: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock }
}

const mockedAuth = auth as unknown as {
  api: {
    getSession: jest.Mock
    signInEmail: jest.Mock
    signUpEmail: jest.Mock
  }
}

describe("/api/admin/auth", () => {
  const originalNodeEnv = process.env.NODE_ENV
  const originalVercelEnv = process.env.VERCEL_ENV

  beforeEach(() => {
    jest.clearAllMocks()
    ;(adminLoginRateLimiter as jest.Mock).mockReturnValue({ allowed: true })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
    mockedPrisma.adminUser.findUnique.mockResolvedValue({
      id: "admin_1",
      username: "Admin",
      email: "admin@example.com",
      password: "hash",
      isActive: true,
      role: { id: "role_1", name: "admin", label: "Admin", permissions: [] },
    })
    mockedPrisma.adminUser.update.mockResolvedValue({})
    mockedPrisma.user.findUnique.mockResolvedValue({ id: "user_1", email: "admin@example.com", role: "admin" })
    mockedPrisma.account.findFirst.mockResolvedValue({ id: "account_1" })
    mockedAuth.api.signInEmail.mockResolvedValue({})
    mockedAuth.api.signUpEmail.mockResolvedValue({})
    mockedPrisma.permissionLog.create.mockResolvedValue({})
  })

  afterEach(() => {
    Object.defineProperty(process.env, "NODE_ENV", { value: originalNodeEnv, configurable: true })
    if (originalVercelEnv === undefined) {
      delete process.env.VERCEL_ENV
    } else {
      process.env.VERCEL_ENV = originalVercelEnv
    }
  })

  function loginRequest(body: unknown) {
    return {
      headers: new Headers(),
      json: async () => body,
    } as never
  }

  it("rejects rate-limited admin login attempts before reading credentials from the database", async () => {
    const errorResponse = {
      status: 429,
      json: async () => ({ error: "请求过于频繁，请稍后再试" }),
    }
    ;(adminLoginRateLimiter as jest.Mock).mockReturnValue({ allowed: false, errorResponse })

    const response = await POST(loginRequest({ email: "admin@example.com", password: "password123" }))
    const body = await response.json()

    expect(response.status).toBe(429)
    expect(body.error).toBe("请求过于频繁，请稍后再试")
    expect(mockedPrisma.adminUser.findUnique).not.toHaveBeenCalled()
  })

  it("fails closed in production when Better Auth sign-in fails", async () => {
    process.env.VERCEL_ENV = "production"
    mockedAuth.api.signInEmail.mockRejectedValue(new Error("auth unavailable"))

    const response = await POST(loginRequest({ email: "admin@example.com", password: "password123" }))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).toBe(false)
    expect(mockedPrisma.session.create).not.toHaveBeenCalled()
  })

  it("records an audit log after successful admin login", async () => {
    const response = await POST(loginRequest({ email: "admin@example.com", password: "password123" }))

    expect(response.status).toBe(200)
    expect(mockedPrisma.permissionLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "UPDATE",
          targetType: "ADMIN_USER",
          targetId: "admin_1",
          operatorId: "admin_1",
          afterData: expect.objectContaining({ event: "ADMIN_LOGIN_SUCCESS" }),
        }),
      })
    )
  })

  it("rejects login with incorrect password", async () => {
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

    const response = await POST(loginRequest({ email: "admin@example.com", password: "wrongpass" }))
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(mockedAuth.api.signInEmail).not.toHaveBeenCalled()
  })

  it("rejects inactive admin user", async () => {
    mockedPrisma.adminUser.findUnique.mockResolvedValue({
      id: "admin_2",
      username: "Inactive",
      email: "inactive@example.com",
      password: "hash",
      isActive: false,
      role: { id: "role_1", name: "admin", label: "Admin", permissions: [] },
    })

    const response = await POST(loginRequest({ email: "inactive@example.com", password: "password123" }))
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(mockedAuth.api.signInEmail).not.toHaveBeenCalled()
  })

  it("rejects unauthenticated /api/admin/auth/me GET request with 401", async () => {
    mockedAuth.api.getSession.mockResolvedValue(null)

    const request = {
      headers: new Headers(),
    } as never

    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
  })
})
