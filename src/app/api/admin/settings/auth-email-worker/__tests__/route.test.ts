jest.mock("next/server", () => ({
  NextRequest: class {},
  NextResponse: { json: (body: unknown, init?: ResponseInit) => ({ status: init?.status ?? 200, json: async () => body }) },
}))

jest.mock("@/server/services/admin-service", () => ({ requireAdminPermission: jest.fn() }))
jest.mock("@/server/services/auth-email-worker-service", () => ({ getAuthEmailWorkerStatus: jest.fn(), updateAuthEmailWorkerConfig: jest.fn() }))
jest.mock("@/lib/permissionLog", () => ({ logUpdate: jest.fn() }))

import { GET } from "../route"

const { requireAdminPermission } = jest.requireMock("@/server/services/admin-service") as { requireAdminPermission: jest.Mock }
const { getAuthEmailWorkerStatus } = jest.requireMock("@/server/services/auth-email-worker-service") as { getAuthEmailWorkerStatus: jest.Mock }
const { forbidden } = jest.requireActual("@/server/contracts/errors") as typeof import("@/server/contracts/errors")

describe("/api/admin/settings/auth-email-worker", () => {
  beforeEach(() => jest.clearAllMocks())

  it("requires worker.view before returning task state", async () => {
    requireAdminPermission.mockRejectedValue(forbidden("没有访问权限"))
    const response = await GET({ headers: new Headers() } as never)
    const body = await response.json()

    expect(requireAdminPermission).toHaveBeenCalledWith(expect.anything(), "worker.view")
    expect(getAuthEmailWorkerStatus).not.toHaveBeenCalled()
    expect(response.status).toBe(403)
    expect(body.success).toBe(false)
  })
})
