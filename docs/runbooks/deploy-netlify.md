# Netlify 部署 Runbook

1. 在 Netlify 项目 Secret Manager 配置数据库、Better Auth、Redis、支付、邮件和 Sentry 变量；不要把运行时密钥写入 `netlify.toml`。
2. 确认 `BETTER_AUTH_URL` 与实际部署域名一致，并设置 `BETTER_AUTH_SECRET`。
3. 部署前运行质量门禁；部署后执行健康检查、认证、支付通知和关键读取路径验证。
4. 记录 deploy ID、环境变量变更、Prisma migration、验证结果和回滚点。
