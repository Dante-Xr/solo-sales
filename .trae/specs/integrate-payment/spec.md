# Integrate Payment Spec

## Why
独立站的核心闭环是交易流转。为了让TikTok引流过来的用户能够顺利完成购买，系统需要集成国际主流的支付网关（PayPal 和 Stripe）。

## What Changes
- 在前台页面添加“结账(Checkout)”弹窗或抽屉视图。
- 集成 Stripe Checkout API 进行信用卡支付处理。
- 集成 PayPal REST API 处理 PayPal 钱包支付。
- 创建相应的后端 API 路由以安全地生成支付会话(Session)和订单(Order)。

## Impact
- Affected specs: 结账流程、订单生成流程
- Affected code: `src/app/page.tsx`, `src/app/api/checkout/*`, `src/components/checkout/*`

## ADDED Requirements
### Requirement: Payment Processing
The system SHALL provide secure payment processing through Stripe and PayPal.

#### Scenario: Success case
- **WHEN** user clicks "立即购买" (Buy Now)
- **THEN** a checkout modal appears with Stripe and PayPal options.
- **WHEN** user completes payment
- **THEN** the system records the Order in the database and shows a success page.
