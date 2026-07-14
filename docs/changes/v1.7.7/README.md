---
version: v1.7.7
status: released
github_milestone: pending
github_tracking_issue: 5
---

# v1.7.7 文档迁移与发布治理

## 版本目标

将现有 `.trae` 文档源迁移到受版本控制的 `docs` 治理结构，建立可校验的来源清单、当前规格和版本发布证据。

## 范围

- 迁移 `.trae/documents`、`.trae/plans` 和 `.trae/specs` 的索引与归档映射。
- 增加 `docs:check`、文档治理规则、当前规格和发布路线图。
- 建立 Issue #5 的 `spec.md`、`tasks.md`、发布记录和 Git tag 证据。
- 修复现有 lint、测试初始化和第三方支付 SDK 类型边界，使发布质量门禁可执行。

## 排除项

- 不修改前端视觉系统、认证、支付、订单、数据库或 RBAC 的业务语义。
- 不主动发布生产环境。

## 候选功能与依赖

文档迁移以当前工作区的 `.trae` 源目录为输入；该目录可保持本地忽略，但 `docs/legacy/inventory.json` 和迁移映射必须受版本控制。

## 发布门禁

执行 `npm run docs:check`、文档校验测试、lint、type-check、secret audit 和 build，并记录可验证证据。
