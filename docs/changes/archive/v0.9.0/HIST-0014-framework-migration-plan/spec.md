---
id: HIST-0014
version: v0.9.0
status: historical
archive_reason: historical_import
source_of_truth: .trae (read-only evidence)
---

# framework-migration-plan

## 迁移结论

这是从旧 `.trae` 资料导入的历史变更单元。它不声明当前行为；当前可执行要求以 [current.md](../../../../specs/current.md) 为准。旧计划中的完成标记只能作为线索，未被自动提升为事实。

## 原始范围线索

- Checklist - 框架迁移计划
- Phase 1: 零成本修复 (v0.9.0)
- next-themes 替换
- TanStack Query 启用
- Phase 2: 安全修复 (v0.10.0)
- Better Auth 替换
- Phase 3: 状态管理升级 (v0.11.0)
- Zustand 替换
- Phase 4: 国际化升级 (v0.12.0)
- next-intl 替换
- Phase 5: 管理后台重构 (v1.0.0)
- Refine 替换
- SoloSales 框架迁移详细执行计划
- Phase 1: 零成本修复
- 1.1 启用 next-themes（替代自建 ThemeProvider）
- 1.2 启用 TanStack Query（替代手动 fetch）
- Phase 2: 安全修复
- 2.1 Better Auth（替代双重认证体系）

## 原始来源

- `.trae/specs/framework-migration-plan/checklist.md`
- `.trae/specs/framework-migration-plan/spec.md`
- `.trae/specs/framework-migration-plan/tasks.md`

## 采纳与验证

- 验证状态：`contradictory_evidence`。
- 旧资料中发现 53 个已勾选项和 67 个未勾选项；不据此推断实现状态。
- 当前代码、测试、Prisma schema、提交和 tag 是事实采纳证据；与旧资料冲突时以这些证据为准。
