jest.mock("next/server", () => ({
  NextResponse: { json: (body: unknown, init?: ResponseInit) => ({ status: init?.status ?? 200, json: async () => body, headers: new Headers() }) },
  NextRequest: class {},
}))
jest.mock("@/server/services/admin-service", () => ({
  requireAdminPermission: jest.fn(), parseCreateAdminUserInput: jest.fn(), createAdminUserFromInput: jest.fn(),
}))
import { POST } from "../route"
import { requireAdminPermission, createAdminUserFromInput } from "@/server/services/admin-service"

describe("POST /api/admin/users", () => {
  it("rejects a non-super-admin before parsing or creating an administrator", async () => {
    ;(requireAdminPermission as jest.Mock).mockResolvedValue({ id: "operator-1", role: { name: "operator" } })
    const response = await POST({ json: async () => ({}) } as never)
    expect(response.status).toBe(403)
    expect(createAdminUserFromInput).not.toHaveBeenCalled()
  })
})
