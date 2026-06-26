<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 下单结算与支付需求 Tasks

## Phase 1: Discovery And Boundaries

- 读取 `src/app/api/orders/route.ts`。
- 读取 `order-service`、`order-repository`、`payment-service`、`src/server/payments/stripe.ts`。
- 确认 PayPal 当前状态。

## Phase 2: Implementation Requirements

- 定义订单输入、服务端计算、库存扣减、幂等键。
- 定义 Stripe checkout、webhook 验签、支付流水去重。
- 定义 PayPal 真实接入要求。
- 定义库存不足、支付失败、重复 webhook、配置错误。

## Phase 3: Tests And Verification

- 测试客户端价格被忽略。
- 测试并发扣库存和库存不足。
- 测试重复 `Idempotency-Key`。
- 测试重复 webhook 不重复 Payment。

## Phase 4: Documentation And Handoff

- 写清交易主链路和直付补建订单差异。
- 标明所有金额字段使用 Decimal。

