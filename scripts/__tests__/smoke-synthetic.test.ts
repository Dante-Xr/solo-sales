/**
 * 修改时间：2026-06-05 00:58:52 +08:00
 * 修改内容：新增 smoke/synthetic 脚本测试，验证依赖故障可接受输出和失败判定规则。
 * 修改模型：gpt-5.5
 */
import { spawn } from "node:child_process"
import { createServer, type IncomingMessage, type ServerResponse } from "node:http"

type MockResponse = {
  status: number
  body?: unknown
}

function json(response: ServerResponse, mock: MockResponse) {
  response.writeHead(mock.status, { "content-type": "application/json" })
  response.end(JSON.stringify(mock.body ?? {}))
}

function html(response: ServerResponse, status = 200) {
  response.writeHead(status, { "content-type": "text/html" })
  response.end("<!doctype html><html><body>ok</body></html>")
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

async function runSmoke(baseUrl: string) {
  const child = spawn(process.execPath, ["scripts/smoke-synthetic.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      SMOKE_BASE_URL: baseUrl,
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

describe("smoke-synthetic script", () => {
  it("accepts standard dependency failures as non-blocking smoke results", async () => {
    await withServer((request, response) => {
      const url = request.url || ""

      if (["/zh", "/zh/products", "/zh/cart", "/zh/admin/login"].includes(url)) {
        html(response)
        return
      }

      if (url === "/api/health") {
        json(response, { status: 503, body: { data: { status: "unhealthy" } } })
        return
      }

      if (url.startsWith("/api/products")) {
        json(response, {
          status: 503,
          body: { success: false, error: { code: "SERVICE_UNAVAILABLE" } },
        })
        return
      }

      if (url === "/api/csrf-token") {
        json(response, { status: 200, body: { success: true, data: { token: "test-token" } } })
        return
      }

      if (url === "/api/checkout/stripe") {
        json(response, { status: 403, body: { error: "缺少 CSRF Token" } })
        return
      }

      if (url === "/api/checkout/paypal") {
        json(response, {
          status: 501,
          body: { success: false, error: { code: "PAYPAL_DISABLED" } },
        })
        return
      }

      if (url === "/api/admin/auth/me") {
        json(response, { status: 401, body: { success: false, error: { code: "UNAUTHORIZED" } } })
        return
      }

      json(response, { status: 404 })
    }, async (baseUrl) => {
      const result = await runSmoke(baseUrl)

      expect(result.stderr).toBe("")
      expect(result.status).toBe(0)
      expect(result.report.ok).toBe(true)
      expect(result.report.summary.failed).toBe(0)
      expect(result.report.summary.dependencyFailures).toBeGreaterThanOrEqual(2)
    })
  })

  it("fails when a required page does not return success", async () => {
    await withServer((request, response) => {
      const url = request.url || ""

      if (url === "/zh") {
        html(response, 500)
        return
      }

      if (["/zh/products", "/zh/cart", "/zh/admin/login"].includes(url)) {
        html(response)
        return
      }

      if (url === "/api/health" || url.startsWith("/api/products")) {
        json(response, { status: 200, body: { success: true, data: {} } })
        return
      }

      if (url === "/api/csrf-token") {
        json(response, { status: 200, body: { success: true, data: { token: "test-token" } } })
        return
      }

      if (url === "/api/checkout/stripe") {
        json(response, { status: 403, body: { error: "缺少 CSRF Token" } })
        return
      }

      if (url === "/api/checkout/paypal") {
        json(response, {
          status: 501,
          body: { success: false, error: { code: "PAYPAL_DISABLED" } },
        })
        return
      }

      if (url === "/api/admin/auth/me") {
        json(response, { status: 401, body: { success: false, error: { code: "UNAUTHORIZED" } } })
        return
      }

      json(response, { status: 404 })
    }, async (baseUrl) => {
      const result = await runSmoke(baseUrl)

      expect(result.status).toBe(1)
      expect(result.report.ok).toBe(false)
      expect(result.report.summary.failed).toBe(1)
    })
  })
})
