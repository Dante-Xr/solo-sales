/**
 * 修改时间：2026-06-05 10:19:27 +08:00
 * 修改内容：新增 v1.5 最小压测与观测基线脚本，输出 QPS、延迟分位、错误率、503、缓存命中和依赖观测指标。
 * 修改模型：gpt-5.5
 */

const DEFAULT_BASE_URL = "http://127.0.0.1:3100"
const DEFAULT_DURATION_SECONDS = 10
const DEFAULT_CONCURRENCY = 4
const DEFAULT_TIMEOUT_MS = 5_000

const baseUrl = normalizeBaseUrl(process.env.BASELINE_BASE_URL || DEFAULT_BASE_URL)
const durationSeconds = positiveNumber(process.env.BASELINE_DURATION_SECONDS, DEFAULT_DURATION_SECONDS)
const concurrency = positiveNumber(process.env.BASELINE_CONCURRENCY, DEFAULT_CONCURRENCY)
const timeoutMs = positiveNumber(process.env.BASELINE_TIMEOUT_MS, DEFAULT_TIMEOUT_MS)

const scenarios = [
  {
    name: "storefront-featured-read",
    kind: "read",
    method: "GET",
    path: "/api/products/featured",
  },
  {
    name: "storefront-products-read",
    kind: "read",
    method: "GET",
    path: "/api/products?page=1&pageSize=3",
  },
  {
    name: "payment-validation-write",
    kind: "write",
    method: "POST",
    path: "/api/checkout/paypal",
    body: { price: -1, quantity: 0 },
    expectedStatuses: [400, 429],
  },
]

const startedAt = new Date()
const stopAt = startedAt.getTime() + durationSeconds * 1_000
const results = []

// 这是当前阶段的可重复基线，不是容量承诺；默认并发保持很小，避免本地误伤数据库或外部依赖。
await Promise.all(Array.from({ length: concurrency }, (_, workerIndex) => runWorker(workerIndex)))

const finishedAt = new Date()
const report = buildReport(results, {
  baseUrl,
  startedAt,
  finishedAt,
  durationSeconds,
  concurrency,
  timeoutMs,
  target: {
    statement: "v1.5 仅建立最小压测与观测门禁，不承诺 10 万 QPS。",
    qpsCommitment: false,
    longTermPressureModel: "100k requests/second",
  },
})

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
process.exitCode = report.ok ? 0 : 1

async function runWorker(workerIndex) {
  let index = workerIndex

  while (Date.now() < stopAt) {
    const scenario = scenarios[index % scenarios.length]
    results.push(await runScenario(scenario))
    index += concurrency
  }
}

async function runScenario(scenario) {
  const started = performance.now()

  try {
    const response = await requestScenario(scenario)
    const durationMs = performance.now() - started
    const body = await safeJson(response)

    return {
      scenario: scenario.name,
      kind: scenario.kind,
      method: scenario.method,
      path: scenario.path,
      status: response.status,
      ok: isExpectedStatus(scenario, response.status),
      durationMs,
      fromCache: Boolean(body?.meta?.fromCache || body?.fromCache),
      dependency: extractDependencyMetrics(body),
      queue: extractQueueMetrics(body),
    }
  } catch (error) {
    return {
      scenario: scenario.name,
      kind: scenario.kind,
      method: scenario.method,
      path: scenario.path,
      status: null,
      ok: false,
      durationMs: performance.now() - started,
      fromCache: false,
      dependency: {},
      queue: {},
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function requestScenario(scenario) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(`${baseUrl}${scenario.path}`, {
      method: scenario.method,
      headers: scenario.body ? { "content-type": "application/json" } : undefined,
      body: scenario.body ? JSON.stringify(scenario.body) : undefined,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

function buildReport(items, config) {
  const elapsedSeconds = Math.max(
    0.001,
    (config.finishedAt.getTime() - config.startedAt.getTime()) / 1_000
  )
  const total = items.length
  const failed = items.filter((item) => !item.ok).length
  const serviceUnavailable = items.filter((item) => item.status === 503).length
  const cacheHits = items.filter((item) => item.fromCache).length
  const readItems = items.filter((item) => item.kind === "read")
  const writeItems = items.filter((item) => item.kind === "write")

  return {
    ok: total > 0 && failed === 0,
    baseUrl: config.baseUrl,
    startedAt: config.startedAt.toISOString(),
    finishedAt: config.finishedAt.toISOString(),
    config: {
      durationSeconds: config.durationSeconds,
      concurrency: config.concurrency,
      timeoutMs: config.timeoutMs,
      scenarios: scenarios.map(({ name, kind, method, path }) => ({ name, kind, method, path })),
    },
    target: config.target,
    metrics: {
      totalRequests: total,
      readRequests: readItems.length,
      writeRequests: writeItems.length,
      qps: round(total / elapsedSeconds),
      p95Ms: percentile(items, 95),
      p99Ms: percentile(items, 99),
      errorRate: total === 0 ? 1 : round(failed / total),
      serviceUnavailableRate: total === 0 ? 0 : round(serviceUnavailable / total),
      cacheHitRate: readItems.length === 0 ? 0 : round(cacheHits / readItems.length),
      dependency: summarizeDependencyMetrics(items),
      queue: summarizeQueueMetrics(items),
    },
    scenarios: summarizeScenarios(items),
  }
}

function summarizeScenarios(items) {
  return scenarios.map((scenario) => {
    const scenarioItems = items.filter((item) => item.scenario === scenario.name)
    const failed = scenarioItems.filter((item) => !item.ok).length

    return {
      name: scenario.name,
      kind: scenario.kind,
      requests: scenarioItems.length,
      qps: round(scenarioItems.length / Math.max(0.001, durationSeconds)),
      p95Ms: percentile(scenarioItems, 95),
      p99Ms: percentile(scenarioItems, 99),
      errorRate: scenarioItems.length === 0 ? 1 : round(failed / scenarioItems.length),
      serviceUnavailable: scenarioItems.filter((item) => item.status === 503).length,
    }
  })
}

function summarizeDependencyMetrics(items) {
  const databaseMs = items
    .map((item) => item.dependency.databaseMs)
    .filter((value) => typeof value === "number")
  const redisMs = items
    .map((item) => item.dependency.redisMs)
    .filter((value) => typeof value === "number")

  return {
    databaseP95Ms: percentileValues(databaseMs, 95),
    redisP95Ms: percentileValues(redisMs, 95),
    observedSamples: databaseMs.length + redisMs.length,
  }
}

function summarizeQueueMetrics(items) {
  const backlogs = items
    .map((item) => item.queue.backlog)
    .filter((value) => typeof value === "number")

  return {
    backlogMax: backlogs.length === 0 ? null : Math.max(...backlogs),
    observedSamples: backlogs.length,
  }
}

function extractDependencyMetrics(body) {
  const checks = body?.data?.checks

  return {
    databaseMs: numberOrNull(checks?.database?.durationMs ?? body?.meta?.databaseMs),
    redisMs: numberOrNull(checks?.redis?.durationMs ?? body?.meta?.redisMs),
  }
}

function extractQueueMetrics(body) {
  return {
    backlog: numberOrNull(body?.data?.queue?.backlog ?? body?.meta?.queueBacklog),
  }
}

async function safeJson(response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function isExpectedStatus(scenario, status) {
  const expectedStatuses = scenario.expectedStatuses || [200, 503]
  return expectedStatuses.includes(status)
}

function percentile(items, percentileValue) {
  return percentileValues(items.map((item) => item.durationMs), percentileValue)
}

function percentileValues(values, percentileValue) {
  if (values.length === 0) return null

  const sorted = [...values].sort((left, right) => left - right)
  const index = Math.min(
    sorted.length - 1,
    Math.ceil((percentileValue / 100) * sorted.length) - 1
  )
  return round(sorted[index])
}

function positiveNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function numberOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function round(value) {
  return Math.round(value * 100) / 100
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "")
}
