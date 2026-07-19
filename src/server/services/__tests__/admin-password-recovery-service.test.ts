jest.mock("@/lib/prisma", () => ({
  prisma: {
    adminUser: { findUnique: jest.fn(), update: jest.fn() },
    user: { findUnique: jest.fn() },
    verification: { findUnique: jest.fn(), delete: jest.fn(), create: jest.fn(), update: jest.fn() },
    accountRecoveryAudit: { create: jest.fn() },
  },
}))

jest.mock("@/lib/auth", () => ({ auth: { api: { resetPassword: jest.fn() } } }))
jest.mock("@/lib/auth/password-policy", () => ({ validatePassword: jest.fn(() => ({ valid: true })) }))
jest.mock("@/lib/auth/recovery-crypto", () => ({
  hashRecoverySecret: jest.fn((value: string) => `hash:${value}`),
  verifyRecoverySecret: jest.fn(() => true),
}))

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { confirmAdminPasswordReset, identifier } from "../admin-password-recovery-service"

describe("confirmAdminPasswordReset", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.AUTH_RECOVERY_HMAC_SECRET = "test-recovery-secret"
    ;(prisma.adminUser.findUnique as jest.Mock).mockResolvedValue({ isActive: true, userId: "user-1" })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "user-1" })
    ;(prisma.verification.findUnique as jest.Mock).mockResolvedValue({
      id: identifier("admin@example.com", "test-recovery-secret"),
      value: "otp-hash:0",
      expiresAt: new Date(Date.now() + 60_000),
    })
    ;(auth.api.resetPassword as unknown as jest.Mock).mockResolvedValue({})
    ;(prisma.verification.delete as jest.Mock).mockResolvedValue({})
    ;(prisma.verification.create as jest.Mock).mockResolvedValue({})
    ;(prisma.accountRecoveryAudit.create as jest.Mock).mockResolvedValue({})
  })

  it("does not recreate an AdminUser password after Better Auth resets the credential", async () => {
    await expect(confirmAdminPasswordReset({
      email: "admin@example.com",
      otp: "123456",
      password: "Secure!Password1",
    })).resolves.toBe(true)

    expect(prisma.adminUser.update).not.toHaveBeenCalled()
  })
})
