/**
 * 修改时间：2026-06-04 16:28:48 +08:00
 * 修改内容：新增统一外部依赖故障保护测试，覆盖数据库瞬断重试、Redis 不可达映射和短超时快速失败。
 * 修改模型：gpt-5.5
 */
import { withDependencyGuard } from "../dependency-guard"

describe("dependency-guard", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("retries transient database failures and then returns the successful result", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined)
    const operation = jest
      .fn()
      .mockRejectedValueOnce({ code: "P1017", message: "Server has closed the connection." })
      .mockResolvedValueOnce("ok")

    try {
      const result = await withDependencyGuard({
        dependency: "database",
        label: "test.database",
        operation,
        maxAttempts: 2,
        timeoutMs: 1000,
      })

      expect(result).toBe("ok")
      expect(operation).toHaveBeenCalledTimes(2)
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[dependency-guard] retrying database.test.database"),
        expect.objectContaining({
          dependency: "database",
          label: "test.database",
          code: "P1017",
        })
      )
    } finally {
      warnSpy.mockRestore()
    }
  })

  it("maps Redis network failures to SERVICE_UNAVAILABLE", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined)

    try {
      await expect(
        withDependencyGuard({
          dependency: "redis",
          label: "test.redis",
          operation: () => Promise.reject(new Error("fetch failed")),
          timeoutMs: 1000,
          unavailableMessage: "缓存服务暂时不可用，请稍后重试",
        })
      ).rejects.toMatchObject({
        code: "SERVICE_UNAVAILABLE",
        statusCode: 503,
        message: "缓存服务暂时不可用，请稍后重试",
      })
    } finally {
      warnSpy.mockRestore()
    }
  })

  it("fails fast when an external dependency exceeds the timeout", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined)

    try {
      await expect(
        withDependencyGuard({
          dependency: "database",
          label: "test.timeout",
          operation: () => new Promise(() => undefined),
          timeoutMs: 1,
          timeoutMessage: "数据库检查超时，请稍后重试",
        })
      ).rejects.toMatchObject({
        code: "SERVICE_UNAVAILABLE",
        statusCode: 503,
        message: "数据库检查超时，请稍后重试",
      })
    } finally {
      warnSpy.mockRestore()
    }
  })
})
