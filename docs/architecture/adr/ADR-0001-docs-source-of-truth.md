---
id: ADR-0001
status: accepted
date: 2026-07-10
---

# ADR-0001 文档事实来源与历史隔离

当前事实由代码、schema、测试、tag 和 `docs/specs/current.md` 共同定义。版本变更只在 `docs/changes` 表达增量。`.trae` 保持只读，并通过 inventory 和 migration map 追溯，不再与 `docs` 双写。
