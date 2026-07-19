jest.mock("@/lib/prisma", () => ({ prisma: {} }))
jest.mock("../auth-email-job-service", () => ({ enqueueAuthEmailBatch: jest.fn() }))
jest.mock("../account-recovery-audit-service", () => ({ recordAccountRecoveryAudit: jest.fn() }))

import { decryptRecoveryPayload, encryptRecoveryPayload } from "@/lib/auth/recovery-crypto"

describe("administrator email change encrypted payload", () => {
  it("keeps both OTP hashes and the target email encrypted at rest", () => {
    const keyring = { activeKeyId: "test", keys: { test: "12345678901234567890123456789012" } }
    const encrypted = encryptRecoveryPayload({ adminId: "admin-1", newEmail: "new@example.com", oldOtpHash: "old-hash", newOtpHash: "new-hash", attempts: "0" }, keyring)
    const serialized = JSON.stringify(encrypted)

    expect(serialized).not.toContain("new@example.com")
    expect(serialized).not.toContain("old-hash")
    expect(decryptRecoveryPayload(encrypted, keyring)).toMatchObject({ adminId: "admin-1", newEmail: "new@example.com", attempts: "0" })
  })
})
