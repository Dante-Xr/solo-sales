<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 非功能需求与验收基线 Checklist

## Documentation Completeness

- [ ] 覆盖安全、性能、可靠性、缓存、外部依赖、日志、监控。
- [ ] 明确 v1.5 不承诺 10 万 QPS。

## Functional Correctness

- [ ] smoke/synthetic 覆盖关键页面和 API。
- [ ] perf baseline 输出 QPS、P95/P99、错误率、503 比例。

## Data And API Contract

- [ ] 依赖故障映射为标准错误。

## Security And Permissions

- [ ] 生产环境密钥、管理员密码、支付 webhook secret 有检查项。

## Reliability And Failure Modes

- [ ] 数据库、Redis、支付、客服都有失败策略。
- [ ] 缓存失败不得拖垮主业务。

## Verification Commands

- [ ] `npm run lint`
- [ ] `node .\node_modules\typescript\bin\tsc --noEmit`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run smoke:synthetic`
- [ ] `npm run perf:baseline`
