jest.mock("@/lib/prisma", () => ({
  prisma: {
    adminUser: { findUnique: jest.fn() },
    verification: { findUnique: jest.fn(), delete: jest.fn() },
    accountRecoveryAudit: { create: jest.fn() },
  },
}))

jest.mock("@/lib/auth/recovery-crypto", () => ({
  decryptRecoveryPayload: jest.fn(),
  encryptRecoveryPayload: jest.fn(() => ({ keyId: "test", iv: "iv", authTag: "tag", ciphertext: "cipher" })),
  generateOtp: jest.fn(() => "123456"),
  hashRecoverySecret: jest.fn(() => "hash"),
  verifyRecoverySecret: jest.fn(() => true),
}))

jest.mock("../auth-email-job-service", () => ({ enqueueAuthEmail: jest.fn() }))
jest.mock("../admin-password-reset-request-service", () => ({ requestAdminPasswordReset: jest.fn() }))

import { decryptRecoveryPayload } from "@/lib/auth/recovery-crypto"
import { prisma } from "@/lib/prisma"
import { requestAdminPasswordReset } from "../admin-password-reset-request-service"
import { confirmDelegatedAdminReset } from "../admin-delegated-reset-service"

describe("confirmDelegatedAdminReset", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.AUTH_RECOVERY_HMAC_SECRET = "test-recovery-secret"
    process.env.AUTH_RECOVERY_ENCRYPTION_KEY = "12345678901234567890123456789012"
    ;(prisma.verification.findUnique as jest.Mock).mockResolvedValue({ id: "operation", identifier: "admin-delegated-reset", value: JSON.stringify({ keyId: "test" }), expiresAt: new Date(Date.now() + 60_000) })
    ;(decryptRecoveryPayload as jest.Mock).mockReturnValue({ operatorId: "operator-1", targetAdminId: "target-1", otpHash: "hash" })
    ;(prisma.adminUser.findUnique as jest.Mock).mockResolvedValue({ id: "target-1", email: "target@example.com", isActive: true, role: { name: "admin" } })
  })

  it("requires the target in the URL to match the OTP operation", async () => {
    await expect(confirmDelegatedAdminReset({ operatorId: "operator-1", targetAdminId: "other-target", operationId: "operation", otp: "123456" })).resolves.toBe(false)
    expect(prisma.verification.delete).not.toHaveBeenCalled()
    expect(requestAdminPasswordReset).not.toHaveBeenCalled()
  })

  it("does not permit a delegated reset for a super administrator", async () => {
    ;(prisma.adminUser.findUnique as jest.Mock).mockResolvedValue({ id: "target-1", email: "target@example.com", isActive: true, role: { name: "super_admin" } })
    await expect(confirmDelegatedAdminReset({ operatorId: "operator-1", targetAdminId: "target-1", operationId: "operation", otp: "123456" })).resolves.toBe(false)
    expect(requestAdminPasswordReset).not.toHaveBeenCalled()
  })
})
