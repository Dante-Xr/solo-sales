/**
 * 修改时间：2026-05-02 19:00:54 +08:00
 * 修改内容：新增 Refine DataProvider 标准响应适配测试，覆盖列表解包、旧数组兼容、错误解析和 custom query。
 * 修改模型：gpt-5.5
 */
import { dataProvider, fetchApi } from "../refine-data-provider"

const mockFetch = jest.fn()

describe("refine-data-provider", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = mockFetch
  })

  it("unwraps standard list payload and uses pagination total", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          list: [{ id: "user_1" }],
          pagination: { total: 42 },
        },
      }),
    })

    const result = await dataProvider.getList({
      resource: "users",
      pagination: { currentPage: 2, pageSize: 20, mode: "server" },
      sorters: [{ field: "createdAt", order: "desc" }],
      filters: [{ field: "isActive", operator: "eq", value: true }],
    })

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/admin/users?page=2&pageSize=20&sortBy=createdAt&sortOrder=desc&isActive=true",
      expect.any(Object)
    )
    expect(result).toEqual({
      data: [{ id: "user_1" }],
      total: 42,
    })
  })

  it("keeps legacy array payload compatible", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ id: "role_1" }, { id: "role_2" }],
      }),
    })

    const result = await dataProvider.getList({ resource: "roles" })

    expect(result.total).toBe(2)
    expect(result.data).toEqual([{ id: "role_1" }, { id: "role_2" }])
  })

  it("uses the real public API path for mapped admin resources", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    })

    await dataProvider.getList({
      resource: "knowledge-categories",
      pagination: { currentPage: 1, pageSize: 100, mode: "server" },
    })

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/knowledge/categories?page=1&pageSize=100",
      expect.any(Object)
    )
  })

  it("extracts structured error messages", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        success: false,
        error: { code: "FORBIDDEN", message: "没有访问权限" },
      }),
    })

    await expect(fetchApi("/api/admin/users")).rejects.toThrow("没有访问权限")
  })

  it("passes custom query parameters and unwraps data", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { ok: true },
      }),
    })

    const result = await dataProvider.custom?.({
      url: "/api/admin/dashboard",
      method: "get",
      query: { range: "7d" },
    })

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/admin/dashboard?range=7d",
      expect.objectContaining({ method: "get" })
    )
    expect(result).toEqual({ data: { ok: true } })
  })
})
