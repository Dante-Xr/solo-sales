<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 非功能需求与验收基线 Spec

## 目的

定义 SoloSales 安全、性能、可靠性、缓存、外部依赖、日志、监控、smoke/synthetic 和 perf baseline 要求。

## Requirement: v1.5 高并发准备边界

系统 SHALL 建立高并发准备能力，但 v1.5 不承诺 10 万 QPS 生产容量。

### Scenario: 性能说明

- WHEN 文档描述性能能力
- THEN SHALL 使用“准备能力、基线、门禁、观测”表述
- AND 不得承诺未经验证的真实容量

## Requirement: 依赖故障降级

数据库、Redis、Stripe、外部客服等依赖 SHALL 具备超时、有限重试、结构化错误和降级策略。

## Requirement: 发布前验证

发布前 SHALL 运行 lint、TypeScript、Jest、build、smoke/synthetic 和 perf baseline 中适用命令。

