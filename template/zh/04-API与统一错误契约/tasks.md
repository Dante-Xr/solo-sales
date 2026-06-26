<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# API 与统一错误契约需求 Tasks

## Phase 1: Discovery And Boundaries

- 读取 `src/server/contracts/api.ts` 和 `errors.ts`。
- 读取 `src/app/api/**/route.ts`。
- 标记历史兼容顶层字段。

## Phase 2: Implementation Requirements

- 定义每个 API 的方法、路径、鉴权、请求参数、响应体。
- 定义错误码、HTTP 状态和业务语义。
- 定义 CSRF、限流、幂等、缓存策略。
- 定义兼容旧字段的保留条件。

## Phase 3: Tests And Verification

- 对成功、验证失败、未登录、无权限、冲突、依赖不可用写测试。
- 检查 `details` 仅开发环境暴露。

## Phase 4: Documentation And Handoff

- 将 API 契约写成表格。
- 将错误矩阵写入 checklist。

