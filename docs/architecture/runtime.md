# 运行链路

请求经 Next.js Route Handler 或 Server Component 进入服务端层；认证和授权在受保护路径执行；服务层以 Zod 校验输入、调用 repository/外部 provider，并通过 contracts 返回标准响应。支付通知必须在验签、金额校验和幂等检查后变更订单与 Payment 状态。

运行依赖：PostgreSQL/Neon、Upstash Redis、Better Auth、支付 provider、邮件服务、可选 AI 客服服务和 Sentry。生产变量必须由 Vercel Environment Variables 或其他托管平台的 Secret Manager 提供；详见 [部署 runbook](../runbooks/deploy-netlify.md)。

后台重任务记录为 `BackgroundJob`。认证邮件 `AUTH_EMAIL_DISPATCH` 由加密持久化队列承载：`netlify/functions/auth-email-worker.mts` 由 Netlify Scheduled Function、外部定时器或后台手动执行触发，并与 token 保护的应急 HTTP 入口竞争同一数据库租约。worker 默认停用，启用前预检数据库、Redis、恢复密钥和 SMTP；任务超过十五分钟进入死信，SMTP 接受后才创建五分钟 OTP。运行记录保留三十天，失败或心跳陈旧会将 `/api/health` 标记为 `degraded`。Vercel 部署必须另行配置定时触发器，详见 [v1.8 验收 runbook](../runbooks/v1.8-password-recovery-acceptance.md)。
