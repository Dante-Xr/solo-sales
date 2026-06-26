<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 项目定位与总体架构 Checklist

## Documentation Completeness

- [ ] 写明 Next.js 16 App Router。
- [ ] 写明模块化单体。
- [ ] 写明 `src/server` 分层。

## Functional Correctness

- [ ] Route Handler 只做 HTTP 入口职责。
- [ ] 业务规则位于 service。
- [ ] Prisma 查询位于 repository 或 service 事务内。

## Data And API Contract

- [ ] 新 API 遵守统一响应。
- [ ] 错误使用统一 `AppError` 和错误码。

## Security And Permissions

- [ ] 敏感路径有鉴权、CSRF 或 RBAC 说明。

## Reliability And Failure Modes

- [ ] 外部依赖有超时、重试、错误映射。

## Verification Commands

- [ ] `npm run lint`
- [ ] `node .\node_modules\typescript\bin\tsc --noEmit`

