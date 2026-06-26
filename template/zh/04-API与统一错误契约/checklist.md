<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# API 与统一错误契约需求 Checklist

## Documentation Completeness

- [ ] 每个 API 有方法、路径、鉴权、请求、响应。
- [ ] 记录兼容字段。

## Functional Correctness

- [ ] 成功响应包含 `success` 和 `data`。
- [ ] 错误响应包含 `success` 和 `error`。

## Data And API Contract

- [ ] 401、403、404、409、422、500、502、503 语义明确。
- [ ] 依赖故障映射为 `SERVICE_UNAVAILABLE`。

## Security And Permissions

- [ ] 写接口说明 CSRF、鉴权、RBAC。
- [ ] 支付和订单说明幂等。

## Reliability And Failure Modes

- [ ] 缓存失败不阻断主流程。
- [ ] 外部依赖超时可控。

## Verification Commands

- [ ] `npm test`
- [ ] `npm run smoke:synthetic`

