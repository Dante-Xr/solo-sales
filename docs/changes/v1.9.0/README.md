---
version: v1.9.0
status: planned
github_milestone: https://github.com/Dante-Xr/solo-sales/milestone/2
github_tracking_issue: https://github.com/Dante-Xr/solo-sales/issues/2
---

# v1.9.0 生产部署与质量门禁

版本总追踪：[GitHub Issue #2](https://github.com/Dante-Xr/solo-sales/issues/2)。

## 版本目标

建立可复现的生产运行时配置、依赖安全、后台任务消费、CI 门禁和监控告警。

## 范围

- 平台 Secret Manager 提供运行时密钥，缺失关键变量时 fail fast。
- 清理 high audit 和弃用 PayPal SDK，禁止 Redis/邮件静默 mock success。
- 为后台任务建立实际消费者、重试状态和可观测失败记录。
- 将 install、audit、lint、type-check、test、build 纳入 CI，并配置 Sentry 与关键失败告警。

## 排除项

- 不以本地构建成功代替生产运行验证。

## 发布门禁

生产变量、worker、通知处理、Sentry、质量命令和部署文档均须在接近生产环境验证；已实现增量必须回写 current spec。
