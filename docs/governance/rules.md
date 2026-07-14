# 文档治理规则

## 来源优先级

1. 运行中的代码、Prisma schema、自动化测试和已发布 tag。
2. `docs/specs/current.md` 的已采纳要求。
3. 已批准版本变更的 `changes/vX.Y.Z/` 规格与真实 GitHub Issue。
4. 历史 archive 与 `.trae` 资料，仅作追溯证据。

## 文件职责

- `specs/current.md`：当前生效事实，使用全局 `REQ-####`。
- `changes/vX.Y.Z/README.md`：版本目标、范围、候选项、依赖和发布门禁。
- `changes/vX.Y.Z/<issue>/spec.md`：相对于 current spec 的增量；`tasks.md`：任务、证据和状态。
- `changes/archive/**/HIST-####-*`：历史导入，不能修改为当前事实。
- `architecture/adr/ADR-####-*.md`：不可逆或影响广泛的技术决策。

## 状态

变更使用 `draft`、`approved`、`in_progress`、`released`、`cancelled`。历史验证使用 `verified`、`partially_verified`、`unverified` 或 `contradictory_evidence`。禁止把旧 checkbox 直接转为 `verified`。

## 版本和链接

目录版本统一 `vX.Y.Z`。每次发布前，将已实施增量并回 `current.md`，更新 release manifest，并为发布说明补充可验证证据。运行 `npm run docs:check` 阻止遗漏映射或归档结构不完整。
