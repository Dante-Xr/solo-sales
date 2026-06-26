<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 数据库模型与状态机需求 Tasks

## Phase 1: Discovery And Boundaries

- 读取 `prisma/schema.prisma`。
- 读取 `src/server/repositories` 和关键 service。
- 列出模型、枚举、索引、唯一约束。

## Phase 2: Implementation Requirements

- 按领域写模型职责和关系。
- 写清 `Payment(provider, transactionId)`、`Product.sku`、`Coupon.code`、`User.email` 等唯一约束。
- 写清 Order、Payment、BackgroundJob、EmailSequenceEnrollment 等状态机。
- 写清事务一致性和并发要求。

## Phase 3: Tests And Verification

- 执行 `npx prisma validate`。
- 涉及 schema 变更时执行 `npx prisma generate`。
- 为订单、支付、积分、优惠券补事务测试。

## Phase 4: Documentation And Handoff

- 记录当前差距和复现要求。
- 标明缓存不是事实源，PostgreSQL/Prisma 才是事实源。

