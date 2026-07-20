---
issue: 8
status: in_progress
---

# #8 任务

- [x] 建立管理员与 Better Auth 单一身份迁移、邮箱约束和恢复审计模型。
- [x] 实施密码策略、OTP、限流、会话撤销、普通与管理员 API。
- [x] 实施 SMTP TLS、加密持久化队列、消费者、重试、死信、运行历史和健康降级。
- [x] 实施管理员激活、代重置、CLI 灾难恢复、双验证码改邮箱与安全审计页。
- [x] 实施普通/管理员登录与重置 UI、国际化与路由保护。
- [x] 实施 Netlify 每分钟 Scheduled Function、数据库租约、`worker.view` / `worker.manage` 和后台任务调度页签。
- [x] 应用认证恢复与 worker Prisma 迁移，并完成 Jest、TypeScript 和生产构建验证。
- [ ] 在 Netlify Preview 完成隔离数据库、真实 Redis/SMTP 的普通、管理员、代重置和 CLI 恢复验收。
- [ ] 在 Netlify Published deploy 确认 Scheduled Function、启用 worker、验证 OTP 与故障恢复；创建 v1.8.0 tag 和 GitHub Release。（已合并 `main`；当前被 Netlify `account credit usage exceeded` 阻塞。）
