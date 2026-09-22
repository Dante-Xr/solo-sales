jest.mock("../auth-email-worker-service", () => ({
  assertAuthEmailWorkerEnabled: jest.fn(),
  getAuthEmailWorkerKeyring: jest.fn(),
}))

jest.mock("nodemailer", () => ({ createTransport: jest.fn() }))
jest.mock("@/lib/prisma", () => ({
  prisma: {
    backgroundJob: { findMany: jest.fn(), updateMany: jest.fn(), update: jest.fn() },
    verification: { upsert: jest.fn() },
  },
}))
jest.mock("../background-job-service", () => ({
  enqueueBackgroundJob: jest.fn(),
  completeBackgroundJob: jest.fn(),
  failBackgroundJob: jest.fn(),
  listRunnableBackgroundJobs: jest.fn(),
}))

import nodemailer from "nodemailer"
import { prisma } from "@/lib/prisma"
import { encryptRecoveryPayload } from "@/lib/auth/recovery-crypto"
import { getAuthEmailWorkerKeyring } from "../auth-email-worker-service"
import { enqueueBackgroundJob, completeBackgroundJob, failBackgroundJob, listRunnableBackgroundJobs } from "../background-job-service"
import { buildDeliveredVerification, isAuthEmailJobStale, enqueueAuthEmail, dispatchAuthEmailJobs } from "../auth-email-job-service"

describe("auth-email-job-service", () => {
  it("dead-letters an authentication message that waited over fifteen minutes", () => {
    const now = new Date("2026-07-19T10:15:01.000Z")
    expect(isAuthEmailJobStale(new Date("2026-07-19T10:00:00.000Z"), now)).toBe(true)
  })

  it("starts the OTP lifetime when SMTP has accepted the message", () => {
    const acceptedAt = new Date("2026-07-19T10:00:00.000Z")
    const verification = buildDeliveredVerification({
      id: "otp-1",
      identifier: "password-reset:user",
      value: "hash:0",
      ttlSeconds: 300,
    }, acceptedAt)

    expect(verification.expiresAt).toEqual(new Date("2026-07-19T10:05:00.000Z"))
  })
})

describe("immediate authentication mail delivery", () => {
  const keyring = { activeKeyId: "test", keys: { test: "k".repeat(32) } }
  const sendMail = jest.fn()
  const close = jest.fn()
  const originalEnv = { ...process.env }
  const input = {
    email: "admin@example.com", otp: "123456", subject: "Reset", text: "Test message",
    verificationJson: JSON.stringify({ id: "otp-1", identifier: "password-reset:admin", value: "hash:0" }),
  }

  beforeEach(() => {
    jest.resetAllMocks()
    process.env.SMTP_HOST = "smtp.example.com"
    process.env.SMTP_PORT = "465"
    process.env.SMTP_USER = "sender@example.com"
    process.env.SMTP_PASS = "test-only"
    ;(getAuthEmailWorkerKeyring as jest.Mock).mockReturnValue(keyring)
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail, close })
    sendMail.mockResolvedValue({ accepted: [input.email] })
    ;(prisma.backgroundJob.updateMany as jest.Mock).mockResolvedValue({ count: 1 })
    ;(enqueueBackgroundJob as jest.Mock).mockImplementation(async ({ payload }) => {
      const job = { id: "job-1", type: "AUTH_EMAIL_DISPATCH", payload, attempts: 0, maxAttempts: 3, createdAt: new Date() }
      ;(prisma.backgroundJob.findMany as jest.Mock).mockResolvedValue([job])
      return job
    })
  })

  afterEach(() => {
    for (const key of ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"]) {
      if (originalEnv[key] === undefined) delete process.env[key]
      else process.env[key] = originalEnv[key]
    }
    jest.useRealTimers()
  })

  it("delivers the newly queued job without waiting for the scheduled worker", async () => {
    await enqueueAuthEmail(input)
    expect(prisma.backgroundJob.findMany).toHaveBeenCalledWith({ where: { id: "job-1", type: "AUTH_EMAIL_DISPATCH" } })
    expect(listRunnableBackgroundJobs).not.toHaveBeenCalled()
    expect(sendMail).toHaveBeenCalledTimes(1)
    expect(prisma.verification.upsert).toHaveBeenCalled()
    expect(completeBackgroundJob).toHaveBeenCalledWith("job-1", expect.any(Date))
    expect(failBackgroundJob).not.toHaveBeenCalled()
  })

  it("retains SMTP failures for scheduled retry without activating the OTP", async () => {
    sendMail.mockRejectedValue(new Error("SMTP unavailable"))
    await enqueueAuthEmail(input)
    expect(failBackgroundJob).toHaveBeenCalledWith(expect.objectContaining({ id: "job-1" }), expect.any(Error), expect.any(Date))
    expect(prisma.verification.upsert).not.toHaveBeenCalled()
    expect(completeBackgroundJob).not.toHaveBeenCalled()
  })

  it("does not send when another worker already owns the job", async () => {
    ;(prisma.backgroundJob.updateMany as jest.Mock).mockResolvedValue({ count: 0 })
    await enqueueAuthEmail(input)
    expect(sendMail).not.toHaveBeenCalled()
    expect(prisma.verification.upsert).not.toHaveBeenCalled()
  })

  it("allows cron to retry the same encrypted job after an immediate failure", async () => {
    const job = { id: "job-1", type: "AUTH_EMAIL_DISPATCH", payload: encryptRecoveryPayload({ ...input, ttlSeconds: "300" }, keyring), attempts: 1, maxAttempts: 3, createdAt: new Date() }
    ;(listRunnableBackgroundJobs as jest.Mock).mockResolvedValue([job])
    expect(await dispatchAuthEmailJobs()).toMatchObject({ delivered: 1 })
    expect(completeBackgroundJob).toHaveBeenCalledWith("job-1", expect.any(Date))
  })

  it("closes a stalled SMTP connection after twenty seconds and schedules retry", async () => {
    jest.useFakeTimers()
    sendMail.mockReturnValue(new Promise(() => {}))
    const pending = enqueueAuthEmail(input)
    await jest.advanceTimersByTimeAsync(20_000)
    await pending
    expect(close).toHaveBeenCalled()
    expect(failBackgroundJob).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ message: "AUTH_EMAIL_SMTP_TIMEOUT" }), expect.any(Date))
    expect(prisma.verification.upsert).not.toHaveBeenCalled()
  })
})
