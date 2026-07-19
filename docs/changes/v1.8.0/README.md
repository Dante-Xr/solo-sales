---
version: v1.8.0
status: in_progress
github_tracking_issue: 8
---

# v1.8.0 邮箱验证码账号恢复与管理员身份安全收敛

版本总追踪：GitHub Issue #8。

## 版本目标

为普通用户和管理员提供可信邮箱验证码找回密码能力，并收敛管理员身份、凭据、邮件投递、会话撤销和安全审计。

## 范围

- 独立的普通与管理员登录、重置页面和服务端 API 作用域。
- OTP、密码策略、Redis 限流、立即会话撤销和安全通知。
- Better Auth 单一管理员凭据源、激活链接、代重置、CLI 灾难恢复和双验证码改邮箱。
- SMTP TLS、加密持久化队列、重试、死信、监控和只读安全审计。
- Netlify 每分钟 Scheduled Function 与后台“任务调度”控制面：权限、启停、间隔、批量、运行历史、死信和手动执行。

## 发布边界

代码、迁移与自动化验证已完成；仍须在 Netlify Published deploy 与隔离数据库完成 Scheduled Function、真实 Redis、SMTP、OTP 重置和故障恢复验收。验收后合并 main 并推送 v1.8.0 tag，不自动部署生产。
