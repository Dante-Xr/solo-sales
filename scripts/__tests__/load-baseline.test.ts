/**
 * 修改时间：2026-06-05 10:19:27 +08:00
 * 修改内容：新增最小压测基线脚本测试，验证指标输出、10 万 QPS 非承诺声明和失败判定规则。
 * 修改模型：gpt-5.5
 */
import { spawn } from "node:child_process"
import { createServer, type IncomingMessage, type ServerResponse } from "node:http"

type MockBody = Record<string, unknown>

function json(response: ServerResponse, status: number, body: MockBody) {
  response.writeHead(status, { "content-type": "application/json" })
  response.end(JSON.stringify(body))
}

async function withServer(
  handler: (request: IncomingMessage, response: ServerResponse) => void,
  callback: (baseUrl: string) => Promise<void>
) {
  const server = createServer(handler)
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))

  const address = server.address()
  if (!address || typeof address === "string") {
    server.close()
    throw new Error("无法获取测试服务器地址")
  }

  try {
    await callback(`http://127.0.0.1:${address.port}`)
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
}

async function runBaseline(baseUrl: string) {
  const child = spawn(process.execPath, ["scripts/load-baseline.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      BASELINE_BASE_URL: baseUrl,
      BASELINE_DURATION_SECONDS: "0.2",
      BASELINE_CONCURRENCY: "1",
      BASELINE_TIMEOUT_MS: "1000",
    },
  })

  let stdout = ""
  let stderr = ""

  child.stdout.setEncoding("utf8")
  child.stderr.setEncoding("utf8")
  child.stdout.on("data", (chunk) => {
    stdout += chunk
  })
  child.stderr.on("data", (chunk) => {
    stderr += chunk
  })

  const status = await new Promise<number | null>((resolve) => {
    child.on("close", resolve)
  })

  return {
    status,
    stderr,
    report: JSON.parse(stdout),
  }
}

describe("load-baseline script", () => {
  it("outputs the Phase 6 baseline metrics without treating 100k QPS as a commitment", async () => {
    await withServer((request, response) => {
      const url = request.url || ""

      if (url.startsWith("/api/products")) {
        json(response, 200, {
          success: true,
          data: [],
          meta: {
            fromCache: true,
            databaseMs: 8,
            redisMs: 2,
            queueBacklog: 0,
          },
        })
        return
      }

      if (url === "/api/checkout/paypal") {
        json(response, 501, {
          success: false,
          error: { code: "PAYPAL_DISABLED", message: "PayPal disabled" },
        })
        return
      }

      json(response, 404, { success: false })
    }, async (baseUrl) => {
      const result = await runBaseline(baseUrl)

      expect(result.stderr).toBe("")
      expect(result.status).toBe(0)
      expect(result.report.ok).toBe(true)
      expect(result.report.target.qpsCommitment).toBe(false)
      expect(result.report.metrics.totalRequests).toBeGreaterThan(0)
      expect(result.report.metrics.qps).toBeGreaterThan(0)
      expect(result.report.metrics.p95Ms).toEqual(expect.any(Number))
      expect(result.report.metrics.p99Ms).toEqual(expect.any(Number))
      expect(result.report.metrics.errorRate).toBe(0)
      expect(result.report.metrics.cacheHitRate).toBeGreaterThan(0)
      expect(result.report.metrics.dependency.observedSamples).toBeGreaterThan(0)
      expect(result.report.metrics.queue.backlogMax).toBe(0)
    })
  })

  it("fails the baseline gate when a representative path returns an unexpected status", async () => {
    await withServer((request, response) => {
      const url = request.url || ""

      if (url.startsWith("/api/products")) {
        json(response, 500, { success: false })
        return
      }

      if (url === "/api/checkout/paypal") {
        json(response, 501, { success: false, error: { code: "PAYPAL_DISABLED" } })
        return
      }

      json(response, 404, { success: false })
    }, async (baseUrl) => {
      const result = await runBaseline(baseUrl)

      expect(result.status).toBe(1)
      expect(result.report.ok).toBe(false)
      expect(result.report.metrics.errorRate).toBeGreaterThan(0)
    })
  })
})
