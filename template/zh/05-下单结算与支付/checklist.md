<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 下单结算与支付需求 Checklist

## Documentation Completeness

- [ ] 覆盖订单、库存、Stripe、webhook、PayPal。
- [ ] 写清状态流转。

## Functional Correctness

- [ ] 服务端计算金额。
- [ ] 事务内扣库存。
- [ ] 订单幂等不重复扣库存。

## Data And API Contract

- [ ] `Payment(provider, transactionId)` 去重。
- [ ] 库存不足返回 `INSUFFICIENT_STOCK`。

## Security And Permissions

- [ ] 支付接口有 CSRF、限流、服务端密钥。
- [ ] webhook 使用 raw body 验签。

## Reliability And Failure Modes

- [ ] Stripe 配置错误和 provider 错误可区分。
- [ ] 重复 webhook 可安全处理。

## Verification Commands

- [ ] `npm test -- src/server/services/__tests__/order-service.test.ts`
- [ ] `npm test -- src/server/services/__tests__/payment-service.test.ts`

