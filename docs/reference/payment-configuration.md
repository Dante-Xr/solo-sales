# 支付配置参考

| 配置 | 用途 | 约束 |
| --- | --- | --- |
| `ENABLED_PAYMENT_PROVIDERS` | 启用 provider 列表 | 只启用凭据完整的 provider |
| `STRIPE_PUBLIC_KEY` | Stripe 客户端标识 | 非 secret |
| `STRIPE_SECRET_KEY` | Stripe 服务端调用 | 平台 Secret Manager |
| `STRIPE_WEBHOOK_SECRET` | Stripe 通知验签 | 平台 Secret Manager |
| 支付宝/微信支付凭据 | API 调用、证书/通知验签 | 平台 Secret Manager，不入库 |

Payment 记录以 `provider` 和 `transactionId` 标识第三方交易；该组合在数据库中唯一。任何 provider 通知均应先验签、校验金额和执行幂等检查。
