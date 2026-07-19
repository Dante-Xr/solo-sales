---
status: current
code_version: 1.8.0
evidence: package.json, prisma/schema.prisma, netlify/functions, src/server, tests, README.md
---

# 当前规格

## 元数据与适用范围

本规格描述当前仓库可观察到的 SoloSales 行为和约束，不承诺未来版本计划中的未完成能力。

## 全局约束

- REQ-0001：服务端状态变更必须在服务端执行输入校验；不得信任客户端计算的订单金额或权限结果。
- REQ-0002：订单、支付、用户、后台和知识库数据访问必须遵守认证、所有者或 RBAC 边界。
- REQ-0003：支付通知必须验证提供商签名、核对金额，并以 provider 事件/交易标识实现幂等处理。
- REQ-0004：生产密钥不得提交到仓库；`npm run audit:secrets` 是发布前检查的一部分。

## 当前要求

- REQ-0005：商品、分类、购物车、认证用户订单和结账由 Next.js Route Handlers 与服务层提供，订单和支付记录持久化于 PostgreSQL。
- REQ-0006：订单状态包含 `PENDING`、`PAID`、`SHIPPED`、`DELIVERED`、`CANCELLED`；Payment 状态包含 `PENDING`、`COMPLETED`、`FAILED`、`REFUNDED`。
- REQ-0007：支付层支持 Stripe、支付宝和微信支付的 provider abstraction；PayPal 不属于 v2.0 上线范围。
- REQ-0008：后台 API、RBAC、商品、订单、评论、营销、导入、分析和知识库能力共享统一契约与错误映射。
- REQ-0009：知识库包含草稿、已发布、归档状态；公开读取不得把草稿或归档内容当成可公开内容。
- REQ-0010：Redis 可用于缓存和限流；外部依赖失败应通过 dependency guard 显式映射，而不是伪造成功。
- REQ-0021：普通用户与管理员密码恢复必须使用分域 API；OTP 为 6 位，SMTP 接受成功后才开始五分钟有效期，连续三次错误后失效。
- REQ-0022：认证邮件任务必须加密持久化；worker 停用时新的恢复请求统一返回 `503` 且不得入队，排队超过十五分钟的认证邮件必须进入死信而不得投递。
- REQ-0023：认证邮件 worker 的配置、运行记录和全局租约必须持久化；仅拥有 `worker.view` / `worker.manage` 的管理员可查看或管理，默认停用，启用前必须预检数据库、Redis、恢复密钥和 SMTP 登录。

## 跨领域不变量

- REQ-0011：金额以数据库 Decimal 和服务端重新计算结果为准。
- REQ-0012：同一 `provider + transactionId` 组合必须唯一；重复支付通知不得重复改变订单、库存或支付结果。
- REQ-0013：服务端模块不得被 Client Component 直接导入。

## 外部契约

- REQ-0014：认证使用 Better Auth，生产必须配置 `BETTER_AUTH_URL` 和 `BETTER_AUTH_SECRET`。
- REQ-0015：数据库使用 `DATABASE_URL`；支付 provider 仅在相应密钥完整时可启用。
- REQ-0024：认证邮件依赖 `UPSTASH_REDIS_REST_URL`、`UPSTASH_REDIS_REST_TOKEN`、SMTP TLS 凭据、`AUTH_RECOVERY_HMAC_SECRET`、32 字节 `AUTH_RECOVERY_ENCRYPTION_KEY` 与其 key ID；密钥不得经后台页面、API 响应或数据库配置返回。

## 已知限制与弃用行为

- REQ-0016：v1.5 的高并发资料只证明准备与门禁，不构成特定 QPS 容量承诺。
- REQ-0017：认证邮件 worker 已具备 Scheduled、手动与应急 HTTP 触发、重试、死信和健康降级代码；Netlify Published Scheduled Function 与真实 SMTP/Redis 端到端运行状态仍须独立验收。完整 RAG 对外能力仍属于未来版本验收范围。
- REQ-0018：`.trae/documents`、`.trae/plans` 和 `.trae/specs` 的 Markdown 源必须在 `docs/legacy/inventory.json` 中有可校验的迁移记录；`npm run docs:check` 必须验证来源哈希、覆盖度和文档链接。
- REQ-0019：用户端界面必须使用暖灰、深海军蓝、酒红色和语义化日/夜间 token；页脚不得与当前主题脱节。
- REQ-0020：首页商品项可携带 `categoryId` 与 `categoryName`；已知分类在中英文界面分别显示对应语言，重复点击当前分类必须恢复全部商品。
