jest.mock("next/server", () => ({
  NextRequest: class {},
  NextResponse: { json: (body: unknown, init?: ResponseInit) => ({ status: init?.status ?? 200, json: async () => body }) },
}))

jest.mock("@/server/services/admin-password-reset-request-service", () => ({
  getAdminPasswordResetEligibility: jest.fn(),
  requestAdminPasswordReset: jest.fn(),
}))
jest.mock("@/lib/auth/recovery-rate-limit", () => ({
  enforceRecoveryRequestRateLimit: jest.fn(),
  RecoveryRateLimitDependencyError: class RecoveryRateLimitDependencyError extends Error {},
  RecoveryRateLimitExceededError: class RecoveryRateLimitExceededError extends Error {},
}))
jest.mock("@/server/services/auth-email-worker-service", () => {
  class AuthEmailWorkerDisabledError extends Error { code = "AUTH_EMAIL_WORKER_DISABLED" }
  return { AuthEmailWorkerDisabledError, assertAuthEmailWorkerEnabled: jest.fn() }
})

import { POST } from "../route"

const { assertAuthEmailWorkerEnabled } = jest.requireMock("@/server/services/auth-email-worker-service") as { assertAuthEmailWorkerEnabled: jest.Mock }
const { enforceRecoveryRequestRateLimit } = jest.requireMock("@/lib/auth/recovery-rate-limit") as { enforceRecoveryRequestRateLimit: jest.Mock }
const { getAdminPasswordResetEligibility } = jest.requireMock("@/server/services/admin-password-reset-request-service") as { getAdminPasswordResetEligibility: jest.Mock }

describe("/api/admin/auth/password-reset/request", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getAdminPasswordResetEligibility.mockResolvedValue({ status: "accepted" })
  })

  it("reports a safe worker-disabled code without exposing the account", async () => {
    const { AuthEmailWorkerDisabledError } = jest.requireMock("@/server/services/auth-email-worker-service") as { AuthEmailWorkerDisabledError: typeof Error }
    const errorSpy = jest.spyOn(console, "error").mockImplementation()
    assertAuthEmailWorkerEnabled.mockRejectedValue(new AuthEmailWorkerDisabledError("disabled"))

    const response = await POST({ headers: new Headers(), json: async () => ({ email: "admin@example.com" }) } as never)

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({ message: "认证邮件服务暂时不可用" })
    expect(errorSpy).toHaveBeenCalledWith("[admin-password-reset-request]", { failureCode: "WORKER_DISABLED", errorName: "AuthEmailWorkerDisabledError" })
    errorSpy.mockRestore()
  })

  it("reports a safe Redis dependency code", async () => {
    const { RecoveryRateLimitDependencyError } = jest.requireMock("@/lib/auth/recovery-rate-limit") as { RecoveryRateLimitDependencyError: typeof Error }
    const errorSpy = jest.spyOn(console, "error").mockImplementation()
    assertAuthEmailWorkerEnabled.mockResolvedValue({ enabled: true })
    enforceRecoveryRequestRateLimit.mockRejectedValue(new RecoveryRateLimitDependencyError("redis unavailable"))

    const response = await POST({ headers: new Headers(), json: async () => ({ email: "admin@example.com" }) } as never)

    expect(response.status).toBe(503)
    expect(errorSpy).toHaveBeenCalledWith("[admin-password-reset-request]", { failureCode: "RATE_LIMIT_DEPENDENCY", errorName: "RecoveryRateLimitDependencyError" })
    errorSpy.mockRestore()
  })
})
