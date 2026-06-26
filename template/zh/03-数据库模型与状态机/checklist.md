<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 数据库模型与状态机需求 Checklist

## Documentation Completeness

- [ ] 覆盖全部核心数据域。
- [ ] 列出模型、字段、关系、枚举。
- [ ] 列出索引和唯一约束。

## Functional Correctness

- [ ] 金额字段使用 Decimal。
- [ ] 订单和支付状态机清晰。
- [ ] 后台任务重试和死信清晰。

## Data And API Contract

- [ ] API 不暴露未授权数据。
- [ ] 缓存不作为事实源。

## Security And Permissions

- [ ] RBAC 模型包含 AdminUser、Role、Permission、PermissionLog。

## Reliability And Failure Modes

- [ ] 并发扣库存有条件更新。
- [ ] 支付 webhook 有幂等约束。

## Verification Commands

- [ ] `npx prisma validate`
- [ ] `npx prisma generate`

