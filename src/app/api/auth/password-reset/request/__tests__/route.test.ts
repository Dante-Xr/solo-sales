jest.mock("next/server", () => ({
  NextRequest: class {},
  NextResponse: { json: (body: unknown, init?: ResponseInit) => ({ status: init?.status ?? 200, json: async () => body }) },
}))

jest.mock("@/server/services/password-recovery-service", () => ({ requestUserPasswordReset: jest.fn() }))
jest.mock("@/lib/auth/recovery-rate-limit", () => ({ enforceRecoveryRequestRateLimit: jest.fn() }))
jest.mock("@/server/services/auth-email-worker-service", () => {
  class AuthEmailWorkerDisabledError extends Error { code = "AUTH_EMAIL_WORKER_DISABLED" }
  return { AuthEmailWorkerDisabledError, assertAuthEmailWorkerEnabled: jest.fn().mockRejectedValue(new AuthEmailWorkerDisabledError("disabled")) }
})

import { POST } from "../route"

const { requestUserPasswordReset } = jest.requireMock("@/server/services/password-recovery-service") as { requestUserPasswordReset: jest.Mock }
const { assertAuthEmailWorkerEnabled } = jest.requireMock("@/server/services/auth-email-worker-service") as { assertAuthEmailWorkerEnabled: jest.Mock }

describe("/api/auth/password-reset/request", () => {
  beforeEach(() => jest.clearAllMocks())

  it("returns a uniform 503 before looking up an account when the worker is disabled", async () => {
    const response = await POST({ headers: new Headers(), json: async () => ({ email: "unknown@example.com" }) } as never)
    const body = await response.json()

    expect(assertAuthEmailWorkerEnabled).toHaveBeenCalled()
    expect(requestUserPasswordReset).not.toHaveBeenCalled()
    expect(response.status).toBe(503)
    expect(body.message).toBe("认证邮件服务暂时不可用")
  })
})
