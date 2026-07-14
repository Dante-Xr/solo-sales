---
issue: 5
version: v1.7.7
status: released
---

# #5 文档迁移与发布治理

## 相对 current spec 的增量

- 将历史 `.trae` 文档的来源清单、迁移去向和文档治理规则纳入受版本控制的 `docs`。
- 增加 `npm run docs:check`，验证来源哈希、覆盖映射、归档完整性和 Markdown 链接。
- 将 v1.7.7、v1.7.8、v1.7.9 的范围、Issue 与路线图建立单一记录。
- 修复既有 lint 违规、Jest 初始化和支付 SDK 类型边界，恢复可重复的质量门禁。

## 验收条件

- `docs/legacy/inventory.json` 覆盖当前 `.trae` 源目录的全部 Markdown 文档。
- `npm run docs:check` 和 `node --test scripts/node-tests/docs-validate.test.mjs` 通过。
- `docs/releases/manifest.json`、`docs/releases/roadmap.md`、版本 README 与 GitHub Issue 一致。

## 非目标

- 不改变商城或后台功能、视觉样式、支付、认证和部署行为。
