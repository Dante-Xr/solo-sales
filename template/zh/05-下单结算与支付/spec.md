<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 下单结算与支付需求 Spec

## 目的

定义订单创建、库存扣减、服务端金额计算、Stripe、PayPal、webhook 和幂等要求。

## Requirement: 服务端金额计算

系统 SHALL 忽略客户端传入的 `price`、`totalAmount`、`paymentStatus`，订单金额和支付金额必须由服务端读取数据库商品价格后计算。

### Scenario: 创建订单

- WHEN 用户提交 `items/productId/quantity/shippingAddress/contactInfo`
- THEN 系统 SHALL 在事务内读取商品、校验库存、计算金额、扣减库存、创建 `Order` 和 `OrderItem`
- AND 初始订单状态 SHALL 为 `PENDING`

## Requirement: 交易幂等

订单创建 SHALL 支持 `Idempotency-Key`，重复请求 SHALL 返回既有订单，不得重复扣库存。

## Requirement: Stripe 支付

Stripe checkout SHALL 使用服务端商品价格创建 session。Stripe webhook SHALL 使用 raw body 验签，并通过 `Payment(provider, transactionId)` 去重。

## Requirement: PayPal 复现要求

当前 PayPal 偏 mock。复现实现 SHALL 按真实支付接入处理服务端金额、订单状态、Payment 流水、失败和 webhook。

