jest.mock("@/lib/prisma", () => ({
  prisma: {
    role: { findUnique: jest.fn() },
    accountRecoveryAudit: { create: jest.fn() },
  },
}))

jest.mock("@/lib/auth/password-policy", () => ({ validatePassword: jest.fn() }))
jest.mock("../auth-email-job-service", () => ({ enqueueAuthEmail: jest.fn() }))

import { validatePassword } from "@/lib/auth/password-policy"
import { prisma } from "@/lib/prisma"
import { enqueueAuthEmail } from "../auth-email-job-service"
import { requestAdminActivation } from "../admin-activation-service"

describe("requestAdminActivation", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.AUTH_RECOVERY_HMAC_SECRET = "test-recovery-secret"
    process.env.AUTH_RECOVERY_ENCRYPTION_KEY = "12345678901234567890123456789012"
  })

  it("does not create an OTP operation for a password rejected by the shared policy", async () => {
    ;(validatePassword as jest.Mock).mockReturnValue({ valid: false, reason: "length" })
    await expect(requestAdminActivation({ operatorId: "operator-1", operatorEmail: "operator@example.com", username: "new-admin", email: "new@example.com", password: "weak", roleId: "role-1" })).resolves.toBe(false)
    expect(prisma.role.findUnique).not.toHaveBeenCalled()
    expect(enqueueAuthEmail).not.toHaveBeenCalled()
  })

  it("does not create an OTP operation for an unknown role", async () => {
    ;(validatePassword as jest.Mock).mockReturnValue({ valid: true })
    ;(prisma.role.findUnique as jest.Mock).mockResolvedValue(null)
    await expect(requestAdminActivation({ operatorId: "operator-1", operatorEmail: "operator@example.com", username: "new-admin", email: "new@example.com", password: "Valid1!Password", roleId: "missing-role" })).resolves.toBe(false)
    expect(enqueueAuthEmail).not.toHaveBeenCalled()
  })
})
