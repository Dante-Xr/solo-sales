<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# API 与统一错误契约需求 Spec

## 目的

定义 SoloSales API 响应、错误、鉴权、CSRF、限流、幂等、缓存和兼容字段要求。

## Requirement: 统一响应

所有新 API SHALL 返回统一结构。成功响应为 `{ success: true, data, meta? }`，错误响应为 `{ success: false, error: { code, message, details? } }`。

### Scenario: API 成功

- WHEN 请求成功
- THEN 响应 SHALL 包含 `success: true`
- AND 业务数据 SHALL 位于 `data`

### Scenario: API 失败

- WHEN 请求失败
- THEN 响应 SHALL 包含 `success: false`
- AND 错误 SHALL 使用统一错误码和 HTTP 状态

## Requirement: 错误语义

系统 SHALL 保留 401、403、404、409、422、500、502、503 的清晰语义，依赖不可用使用 `SERVICE_UNAVAILABLE`。

## Requirement: 写接口保护

写接口 SHOULD 使用 CSRF、鉴权、限流或 RBAC。订单和支付 SHALL 具备幂等或重放保护。

