---
issue: 5
status: completed
---

# #5 任务

## 实施步骤

- [x] 建立受版本控制的 `docs` 文档治理结构和历史迁移映射。
- [x] 增加来源清单、文档验证脚本和节点测试。
- [x] 创建 GitHub Issue #5，并同步 v1.7.7-v1.7.9 路线图。
- [x] 运行发布门禁并记录验证结果。
- [x] 合并至 `main`、创建 `v1.7.7` tag，并生成发布记录。

## 验证证据

- `node scripts/docs-validate.mjs`：通过。
- `node --test scripts/node-tests/docs-validate.test.mjs`：2/2 通过。
- `node node_modules/eslint/bin/eslint.js .`：0 error、0 warning。
- `node node_modules/typescript/bin/tsc --noEmit`：通过。
- `node scripts/secret-audit.mjs`：通过。
- `node node_modules/jest/bin/jest.js --runInBand --forceExit`：98 suites 通过，375 passed、1 skipped；仍有历史异步句柄，未使用 `--forceExit` 时 Jest 不会自行退出。
- 以临时 `DATABASE_URL` 执行 `node node_modules/next/dist/bin/next build`：通过；未部署生产。

## 风险与阻塞

- `.trae` 源目录是本地忽略内容；验证必须在包含该源目录的工作树执行。
