import { RecoveryFailureCode } from "@/lib/auth/recovery-audit"
import { recordAccountRecoveryAudit } from "../account-recovery-audit-service"

describe("recordAccountRecoveryAudit", () => {
  it("persists only the sanitized audit event", async () => {
    const create = jest.fn().mockResolvedValue({ id: "audit-1" })

    await recordAccountRecoveryAudit({
      db: { accountRecoveryAudit: { create } },
      event: {
        scope: "USER_PASSWORD_RESET",
        result: "REJECTED",
        failureCode: RecoveryFailureCode.ACCOUNT_DISABLED,
        email: "locked@example.com",
        ipAddress: "203.0.113.5",
        hmacSecret: "test-hmac-secret",
      },
      jobId: "job-1",
    })

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        scope: "USER_PASSWORD_RESET",
        result: "REJECTED",
        failureCode: "ACCOUNT_DISABLED",
        jobId: "job-1",
      }),
    })

    expect(JSON.stringify(create.mock.calls[0][0])).not.toContain("locked@example.com")
    expect(JSON.stringify(create.mock.calls[0][0])).not.toContain("203.0.113.5")
  })

  it("does not make an audit persistence failure affect the caller", async () => {
    const create = jest.fn().mockRejectedValue(new Error("database unavailable"))

    await expect(recordAccountRecoveryAudit({
      db: { accountRecoveryAudit: { create } },
      event: {
        scope: "ADMIN_PASSWORD_RESET",
        result: "FAILED",
        failureCode: RecoveryFailureCode.DEPENDENCY_UNAVAILABLE,
        email: "admin@example.com",
        hmacSecret: "test-hmac-secret",
      },
    })).resolves.toBeUndefined()
  })
})
