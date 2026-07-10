---
id: HIST-0012
version: v0.0.0
status: historical
archive_reason: historical_import
source_of_truth: .trae (read-only evidence)
---

# fix-locale-switch-404

## 迁移结论

这是从旧 `.trae` 资料导入的历史变更单元。它不声明当前行为；当前可执行要求以 [current.md](../../../../specs/current.md) 为准。旧计划中的完成标记只能作为线索，未被自动提升为事实。

## 原始范围线索

- 修复语言切换 404 错误 Spec
- Why
- What Changes
- Impact
- ADDED Requirements
- Requirement: 语言切换必须使用 next-intl 官方 API
- MODIFIED Requirements
- Requirement: LanguageSwitcher 组件
- Requirement: AdminLayout 语言切换
- Requirement: admin/settings 语言切换
- Tasks
- Task Dependencies

## 原始来源

- `.trae/specs/fix-locale-switch-404/checklist.md`
- `.trae/specs/fix-locale-switch-404/spec.md`
- `.trae/specs/fix-locale-switch-404/tasks.md`

## 采纳与验证

- 验证状态：`partially_verified`。
- 旧资料中发现 16 个已勾选项和 0 个未勾选项；不据此推断实现状态。
- 当前代码、测试、Prisma schema、提交和 tag 是事实采纳证据；与旧资料冲突时以这些证据为准。
