import { createRecoveryAuditEvent, RecoveryFailureCode } from "../recovery-audit"

describe("createRecoveryAuditEvent", () => {
  it("records a standard failure code and irreversible fingerprints", () => {
    const event = createRecoveryAuditEvent({
      scope: "USER_PASSWORD_RESET",
      result: "FAILED",
      failureCode: RecoveryFailureCode.ACCOUNT_NOT_FOUND,
      email: "  Test.User@Example.com ",
      ipAddress: "203.0.113.5",
      hmacSecret: "test-hmac-secret",
    })

    expect(event.scope).toBe("USER_PASSWORD_RESET")
    expect(event.result).toBe("FAILED")
    expect(event.failureCode).toBe("ACCOUNT_NOT_FOUND")
    expect(event.accountFingerprint).toMatch(/^[a-f0-9]{64}$/)
    expect(event.ipFingerprint).toMatch(/^[a-f0-9]{64}$/)
    expect(JSON.stringify(event)).not.toContain("Test.User@Example.com")
    expect(JSON.stringify(event)).not.toContain("203.0.113.5")
  })

  it("normalizes equivalent email addresses before fingerprinting", () => {
    const base = {
      scope: "ADMIN_PASSWORD_RESET" as const,
      result: "REJECTED" as const,
      failureCode: RecoveryFailureCode.ACCOUNT_SCOPE_MISMATCH,
      ipAddress: "203.0.113.5",
      hmacSecret: "test-hmac-secret",
    }

    expect(createRecoveryAuditEvent({ ...base, email: "ADMIN@EXAMPLE.COM" }).accountFingerprint)
      .toBe(createRecoveryAuditEvent({ ...base, email: " admin@example.com " }).accountFingerprint)
  })

  it("rejects unrecognized failure codes", () => {
    expect(() => createRecoveryAuditEvent({
      scope: "USER_PASSWORD_RESET",
      result: "FAILED",
      failureCode: "DATABASE_ERROR" as RecoveryFailureCode,
      email: "test@example.com",
      ipAddress: "203.0.113.5",
      hmacSecret: "test-hmac-secret",
    })).toThrow("Unsupported recovery failure code")
  })
})
