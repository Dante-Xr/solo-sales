# 配置支付提供商

1. 在平台 Secret Manager 中配置 `ENABLED_PAYMENT_PROVIDERS`，只列出已具备完整凭据的 provider。
2. 配置 Stripe 的 publishable key、secret key 和 webhook secret；配置支付宝和微信支付所需的应用、证书与通知地址凭据。
3. 在非生产环境先完成 provider 测试通知，确认签名验证、金额校验和重复通知幂等。
4. 不提交 `.env` 或私钥；运行 `npm run audit:secrets`。

变量名称和责任边界见 [支付配置参考](../reference/payment-configuration.md)。
