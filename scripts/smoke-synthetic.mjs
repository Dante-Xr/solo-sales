/**
 * 修改时间：2026-06-05 00:58:52 +08:00
 * 修改内容：新增 v1.5 smoke/synthetic 契约验证脚本，覆盖关键页面、API、依赖故障与负向校验路径。
 * 修改模型：gpt-5.5
 */

const DEFAULT_BASE_URL = "http://127.0.0.1:3100"

const baseUrl = normalizeBaseUrl(
  process.env.SMOKE_BASE_URL || process.env.SYNTHETIC_BASE_URL || DEFAULT_BASE_URL
)

const checks = [
  pageCheck("/zh", "首页页面可访问"),
  pageCheck("/zh/products", "商品列表页面可访问"),
  pageCheck("/zh/cart", "购物车页面可访问"),
  pageCheck("/zh/admin/login", "后台登录页面可访问"),
  dependencyAwareApiCheck("/api/health", "健康检查契约"),
  csrfTokenCheck(),
  dependencyAwareApiCheck("/api/products?page=1&pageSize=3", "商品列表 API 契约"),
  dependencyAwareApiCheck("/api/products/featured", "Featured 商品 API 契约"),
  stripeNegativeCheck(),
  paypalNegativeCheck(),
  adminMeNegativeCheck(),
]

const startedAt = new Date().toISOString()
const results = []

for (const check of checks) {
  // 按固定顺序执行，便于 CI 日志与本地排查对齐到具体入口。
  results.push(await runCheck(check))
}

const failed = results.filter((item) => item.outcome === "failed")
const dependencyFailures = results.filter((item) => item.classification === "dependency-failure")
const summary = {
  passed: results.length - failed.length,
  failed: failed.length,
  dependencyFailures: dependencyFailures.length,
}

const report = {
  baseUrl,
  startedAt,
  finishedAt: new Date().toISOString(),
  ok: failed.length === 0,
  summary,
  checks: results,
}

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
process.exitCode = report.ok ? 0 : 1

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "")
}

function pageCheck(path, name) {
  return {
    name,
    method: "GET",
    path,
    expected: "HTTP 200",
    classification: "fallback-success",
    validate: async () => {
      const response = await request(path)
      if (response.status !== 200) {
        return fail(response, `页面期望 200，实际 ${response.status}`)
      }
      return pass(response, "页面返回 200，可作为前台兜底成功入口")
    },
  }
}

function dependencyAwareApiCheck(path, name) {
  return {
    name,
    method: "GET",
    path,
    expected: "HTTP 200 success 或 HTTP 503 SERVICE_UNAVAILABLE",
    classification: "normal-success",
    validate: async () => {
      const response = await requestJson(path)

      if (response.status === 200 && isSuccessEnvelope(response.body)) {
        return pass(response, "API 返回标准成功响应", "normal-success")
      }

      if (response.status === 503 && isServiceUnavailable(response.body)) {
        return pass(response, "依赖故障返回标准 SERVICE_UNAVAILABLE", "dependency-failure")
      }

      return fail(response, `期望标准成功或依赖故障，实际 ${response.status}`)
    },
  }
}

function csrfTokenCheck() {
  return {
    name: "CSRF Token API 契约",
    method: "GET",
    path: "/api/csrf-token",
    expected: "HTTP 200 success 且 token 存在",
    classification: "normal-success",
    validate: async () => {
      const response = await requestJson("/api/csrf-token")
      const token = response.body?.data?.token || response.body?.token

      if (response.status === 200 && isSuccessEnvelope(response.body) && typeof token === "string") {
        return pass(response, "CSRF token 返回标准成功响应")
      }

      return fail(response, `CSRF token 契约不符合预期，实际 ${response.status}`)
    },
  }
}

function stripeNegativeCheck() {
  return {
    name: "Stripe 支付负向校验",
    method: "POST",
    path: "/api/checkout/stripe",
    expected: "HTTP 403 缺少 CSRF Token",
    classification: "negative-validation",
    validate: async () => {
      const response = await requestJson("/api/checkout/stripe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      })

      if (response.status === 403) {
        return pass(response, "缺少 CSRF 时支付入口被拒绝", "negative-validation")
      }

      return fail(response, `Stripe 负向校验期望 403，实际 ${response.status}`)
    },
  }
}

function paypalNegativeCheck() {
  return {
    name: "PayPal 支付负向校验",
    method: "POST",
    path: "/api/checkout/paypal",
    expected: "HTTP 400 标准校验错误",
    classification: "negative-validation",
    validate: async () => {
      const response = await requestJson("/api/checkout/paypal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ price: -1, quantity: 0 }),
      })

      if (response.status === 400 && isErrorEnvelope(response.body)) {
        return pass(response, "非法 PayPal 参数返回标准错误响应", "negative-validation")
      }

      return fail(response, `PayPal 负向校验期望 400 标准错误，实际 ${response.status}`)
    },
  }
}

function adminMeNegativeCheck() {
  return {
    name: "后台当前用户未登录校验",
    method: "GET",
    path: "/api/admin/auth/me",
    expected: "HTTP 401 标准未授权错误",
    classification: "negative-validation",
    validate: async () => {
      const response = await requestJson("/api/admin/auth/me")

      if (response.status === 401 && isErrorEnvelope(response.body)) {
        return pass(response, "未登录后台用户返回标准未授权错误", "negative-validation")
      }

      return fail(response, `后台当前用户期望 401 标准错误，实际 ${response.status}`)
    },
  }
}

async function runCheck(check) {
  try {
    return {
      name: check.name,
      method: check.method,
      path: check.path,
      expected: check.expected,
      ...(await check.validate()),
    }
  } catch (error) {
    return {
      name: check.name,
      method: check.method,
      path: check.path,
      expected: check.expected,
      status: null,
      outcome: "failed",
      classification: check.classification,
      message: error instanceof Error ? error.message : String(error),
    }
  }
}

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init)
  return {
    status: response.status,
    body: null,
  }
}

async function requestJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init)
  const text = await response.text()

  return {
    status: response.status,
    body: parseJson(text),
  }
}

function parseJson(text) {
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function isSuccessEnvelope(body) {
  return body?.success === true
}

function isErrorEnvelope(body) {
  return body?.success === false || Boolean(body?.error)
}

function isServiceUnavailable(body) {
  const code = body?.error?.code || body?.code
  const status = body?.data?.status || body?.status
  return code === "SERVICE_UNAVAILABLE" || status === "unhealthy"
}

function pass(response, message, classification) {
  return {
    status: response.status,
    outcome: "passed",
    classification: classification || "normal-success",
    message,
  }
}

function fail(response, message) {
  return {
    status: response.status,
    outcome: "failed",
    classification: "normal-success",
    message,
  }
}
