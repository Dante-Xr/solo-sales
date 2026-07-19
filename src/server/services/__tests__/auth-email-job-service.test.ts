jest.mock("../auth-email-worker-service", () => ({
  assertAuthEmailWorkerEnabled: jest.fn(),
  getAuthEmailWorkerKeyring: jest.fn(),
}))

import { buildDeliveredVerification, isAuthEmailJobStale } from "../auth-email-job-service"

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
