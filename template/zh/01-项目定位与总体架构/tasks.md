<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 项目定位与总体架构 Tasks

## Phase 1: Discovery And Boundaries

- 读取 `README.md`、`src/server/README.md`、`package.json`。
- 读取 Next.js 16 本地文档中 App Router 和 Route Handler 章节。
- 确认当前系统不是微服务。

## Phase 2: Implementation Requirements

- 记录 `src/app`、`src/server`、`src/lib`、`prisma`、`scripts` 的职责。
- 固化 `route -> service -> repository -> database` 数据流。
- 固化统一 API 契约和 `server-only` 服务端边界。

## Phase 3: Tests And Verification

- 对架构改动运行 `npm run lint`、`node .\node_modules\typescript\bin\tsc --noEmit`。
- 对涉及页面或 API 的改动运行相关 Jest 测试。

## Phase 4: Documentation And Handoff

- 将架构决策写入对应功能 spec。
- 标明禁止偏离：微服务拆分、客户端信任金额、route 内堆复杂业务。

