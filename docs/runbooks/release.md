# 发布 Runbook

1. 确认版本 README 的范围和排除项，所有已实施 delta 已并入 current spec。
2. 运行 `npm run docs:check`、测试、lint、type-check、secret audit 与 build。
3. 核对 package 版本、Git tag、HEAD 和 release manifest；差异必须明确标记，不能静默发布。
4. 创建 tag 和 GitHub Release，更新 `docs/releases/vX.Y.Z.md` 与 manifest 的证据。
