<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 文档体系说明 Tasks

## Phase 1: Discovery And Boundaries

- 读取 `README.md`、`.trae/specs`、`CHANGELOG.md`、`RELEASES.md`。
- 确认目标文档是需求模板，不是实现记录。
- 确认当前版本基线为 `v1.5.0`。

## Phase 2: Implementation Requirements

- 为每个主题维护 `spec.md`、`tasks.md`、`checklist.md`。
- 在 `spec.md` 使用 `Requirement / Scenario / SHALL / WHEN / THEN / AND`。
- 在 `tasks.md` 写清依赖、目标文件、验证命令。
- 在 `checklist.md` 写清文档、功能、数据、安全、验证门禁。

## Phase 3: Tests And Verification

- 验证每个主题目录都有 3 个文件。
- 验证中文文件头包含修改时间、修改内容、修改模型。
- 验证文档覆盖前台、数据库、下单、鉴权、后台和非功能要求。

## Phase 4: Documentation And Handoff

- 将模板使用说明写入 `00-documentation-system/spec.md`。
- 将后续具体需求落到 `.trae/specs/{feature}`。

