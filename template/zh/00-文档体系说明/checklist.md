<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 文档体系说明 Checklist

## Documentation Completeness

- [ ] 说明 `template`、`README.md`、`.trae/specs`、`CHANGELOG.md` 的关系。
- [ ] 每个主题目录都有 `spec.md`、`tasks.md`、`checklist.md`。
- [ ] 中文和英文主题数量一致。

## Functional Correctness

- [ ] 文档未把模板误写成已实现功能。
- [ ] 文档要求 AI 先读取仓库事实。

## Data And API Contract

- [ ] 文档保留统一 API 契约与数据模型约束。

## Security And Permissions

- [ ] 文档要求敏感实现前确认鉴权、CSRF、RBAC。

## Reliability And Failure Modes

- [ ] 文档要求覆盖依赖故障、空状态、错误状态。

## Verification Commands

- [ ] `Get-ChildItem template\zh -Recurse -Filter *.md | Measure-Object`
- [ ] `rg -n "修改时间|修改内容|修改模型" template\zh`

