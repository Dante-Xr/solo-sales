---
version: v2.0.0
status: planned
github_milestone: https://github.com/Dante-Xr/solo-sales/milestone/3
github_tracking_issue: https://github.com/Dante-Xr/solo-sales/issues/3
---

# v2.0.0 上线验收与正式发布

版本总追踪：[GitHub Issue #3](https://github.com/Dante-Xr/solo-sales/issues/3)。

## 版本目标

冻结范围，验证登录、下单、支付、订单追踪、后台运营、客服知识库与生产部署已达到上线标准。

## 范围

- Stripe、支付宝、微信支付成功、失败、通知验签与重复通知幂等验收。
- 匿名和越权访问后台、订单、知识库和财务接口必须被拒绝。
- 生产变量、CI、audit、worker、Sentry 和发布资料完成验收。

## 排除项

- PayPal 和游客下单不进入 Go/No-Go。

## 发布门禁

在接近生产环境通过关键主链路，并通过 `npm test -- --runInBand`、`npm run lint`、`npm run type-check`、`npm run audit:secrets`、`npm run build`。
