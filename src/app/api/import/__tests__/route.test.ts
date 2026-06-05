/**
 * 修改时间：2026-06-05 10:11:44 +08:00
 * 修改内容：新增导入路由异步入队契约测试，验证 async 模式返回 202 且默认同步路径保持兼容。
 * 修改模型：gpt-5.5
 */
jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
  NextRequest: class {},
}))

import { POST } from "../route"

jest.mock("@/server/services/inventory-service", () => ({
  enqueueWholesalerImport: jest.fn(),
  parseImportRequest: jest.fn(),
  runWholesalerImport: jest.fn(),
}))

const {
  enqueueWholesalerImport,
  parseImportRequest,
  runWholesalerImport,
} = jest.requireMock("@/server/services/inventory-service") as {
  enqueueWholesalerImport: jest.Mock
  parseImportRequest: jest.Mock
  runWholesalerImport: jest.Mock
}

describe("/api/import", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  function requestJson(body: unknown) {
    return {
      json: async () => body,
    } as never
  }

  it("enqueues wholesaler import and returns 202 in async mode", async () => {
    parseImportRequest.mockReturnValue({
      wholesaler: "1866",
      execution: "async",
      options: { pageSize: 50, skipDuplicates: true },
    })
    enqueueWholesalerImport.mockResolvedValue({
      id: "job_1",
      type: "WHOLESALER_IMPORT",
      status: "QUEUED",
    })

    const response = await POST(requestJson({ execution: "async" }))
    const body = await response.json()

    expect(response.status).toBe(202)
    expect(body.success).toBe(true)
    expect(body.data).toEqual({
      accepted: true,
      jobId: "job_1",
      type: "WHOLESALER_IMPORT",
      status: "QUEUED",
    })
    expect(body.meta).toEqual({ execution: "async" })
    expect(runWholesalerImport).not.toHaveBeenCalled()
  })

  it("keeps the existing synchronous import behavior by default", async () => {
    parseImportRequest.mockReturnValue({
      wholesaler: "1866",
      execution: "sync",
      options: { pageSize: 10 },
    })
    runWholesalerImport.mockResolvedValue({ success: true, total: 1 })

    const response = await POST(requestJson({}))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.data).toEqual({ success: true, total: 1 })
    expect(enqueueWholesalerImport).not.toHaveBeenCalled()
  })
})
