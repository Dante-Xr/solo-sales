---
id: HIST-0027
version: v1.6.0
status: historical
archive_reason: historical_import
source_of_truth: .trae (read-only evidence)
---

# v1.6-launch-security-hardening

## 迁移结论

这是从旧 `.trae` 资料导入的历史变更单元。它不声明当前行为；当前可执行要求以 [current.md](../../../../specs/current.md) 为准。旧计划中的完成标记只能作为线索，未被自动提升为事实。

## 原始范围线索

- 文档基线
- API 权限
- 订单隐私
- PayPal Mock 禁用
- 管理员登录安全
- 密钥处置
- Verification Commands
- Why
- What Changes
- Impact
- ADDED Requirements
- Requirement: 后台和运营 API 服务端鉴权
- Requirement: 订单访问必须校验 viewer
- Requirement: PayPal mock 生产禁用
- Requirement: 管理员登录生产安全
- Requirement: 密钥泄漏处置
- MODIFIED Requirements
- Requirement: proxy/middleware 边界

## 原始来源

- `.trae/specs/v1.6-launch-security-hardening/checklist.md`
- `.trae/specs/v1.6-launch-security-hardening/spec.md`
- `.trae/specs/v1.6-launch-security-hardening/tasks.md`

## 采纳与验证

- 验证状态：`contradictory_evidence`。
- 旧资料中发现 94 个已勾选项和 8 个未勾选项；不据此推断实现状态。
- 当前代码、测试、Prisma schema、提交和 tag 是事实采纳证据；与旧资料冲突时以这些证据为准。
