<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 非功能需求与验收基线 Tasks

## Phase 1: Discovery And Boundaries

- 读取 `scripts/smoke-synthetic.mjs` 和 `scripts/load-baseline.mjs`。
- 读取 `dependency-guard`、`cache`、`redis`、Sentry 配置。
- 确认环境变量和默认端口。

## Phase 2: Implementation Requirements

- 定义安全、性能、可靠性、缓存、日志、监控要求。
- 定义外部依赖超时、重试、降级、错误码。
- 定义 smoke/synthetic 和 perf baseline 覆盖范围。

## Phase 3: Tests And Verification

- 运行 `npm run lint`。
- 运行 `node .\node_modules\typescript\bin\tsc --noEmit`。
- 运行 `npm test`。
- 运行 `npm run build`。
- 本地服务可用时运行 smoke 和 perf baseline。

## Phase 4: Documentation And Handoff

- 记录未运行命令及原因。
- 记录环境变量、数据库和 Redis 依赖状态。

