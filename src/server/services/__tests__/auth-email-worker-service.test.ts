import {
  AUTH_EMAIL_WORKER_CONFIG_ID,
  assertAuthEmailWorkerEnabled,
  updateAuthEmailWorkerConfig,
} from "../auth-email-worker-service"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    authEmailWorkerConfig: {
      upsert: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock("@/lib/redis", () => ({
  __esModule: true,
  default: { ping: jest.fn() },
}))

jest.mock("nodemailer", () => ({
  __esModule: true,
  default: { createTransport: jest.fn() },
}))

const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: { authEmailWorkerConfig: { upsert: jest.Mock; update: jest.Mock } }
}

describe("auth-email-worker-service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("uses a disabled singleton as the safe initial worker configuration", async () => {
    prisma.authEmailWorkerConfig.upsert.mockResolvedValue({ id: AUTH_EMAIL_WORKER_CONFIG_ID, enabled: false })

    await expect(assertAuthEmailWorkerEnabled()).rejects.toMatchObject({ code: "AUTH_EMAIL_WORKER_DISABLED" })
    expect(prisma.authEmailWorkerConfig.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: AUTH_EMAIL_WORKER_CONFIG_ID },
      create: expect.objectContaining({ enabled: false, intervalMinutes: 5, batchSize: 5 }),
    }))
  })

  it("runs dependency preflight before allowing an administrator to enable delivery", async () => {
    prisma.authEmailWorkerConfig.upsert.mockResolvedValue({ id: AUTH_EMAIL_WORKER_CONFIG_ID, enabled: false })
    const originalSmtpHost = process.env.SMTP_HOST
    delete process.env.SMTP_HOST

    try {
      await expect(updateAuthEmailWorkerConfig({ enabled: true, intervalMinutes: 1, batchSize: 10 })).rejects.toThrow("SMTP")
      expect(prisma.authEmailWorkerConfig.update).not.toHaveBeenCalled()
    } finally {
      process.env.SMTP_HOST = originalSmtpHost
    }
  })
})
