<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 文档体系说明 Spec

## 目的

本目录定义 SoloSales v1.5.0 的 AI 可复现开发需求文档体系。它服务于产品、架构、开发、测试和 AI agent，用于把当前独立站抽象为可执行的软件需求。

## Requirement: 文档体系边界

系统 SHALL 将 `template` 作为需求模板库，而不是替代 `README.md`、`.trae/specs`、`CHANGELOG.md` 或 `RELEASES.md`。

### Scenario: 从模板生成具体功能需求

- WHEN 需要实现新功能
- THEN 实施者 SHALL 从本目录复制对应主题的 `spec.md`、`tasks.md`、`checklist.md`
- AND 将它们落到 `.trae/specs/{feature}` 后再补充具体功能上下文

## Requirement: AI 执行约束

AI agent SHALL 先读取当前仓库事实，再做实现判断。涉及 Next.js 16 的页面、Route Handler、配置或中间件实现前，SHALL 读取 `node_modules/next/dist/docs/` 中相关文档。

### Scenario: AI 复现开发

- WHEN AI 根据本文档复现 SoloSales
- THEN AI SHALL 保持模块化单体、统一 API 契约、`src/server` 分层、Prisma 数据模型和验证命令
- AND 不得把未完成能力描述成已完成能力

## 关系

- `README.md`: 当前项目能力总览
- `.trae/specs`: 具体功能的执行规格
- `template`: 可复用需求骨架
- `CHANGELOG.md` / `RELEASES.md`: 已发布变更记录

