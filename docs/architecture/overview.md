# 架构概览

SoloSales 是 Next.js 16 App Router 的模块化单体。页面和 Route Handlers 位于 `src/app`；服务端业务逻辑在 `src/server`；Prisma 连接 PostgreSQL；Redis 用于缓存和限流；Better Auth 管理会话；支付通过 provider abstraction 集成 Stripe、支付宝和微信支付。

## 边界

- `src/app`：前台、后台和 HTTP 边界。
- `src/server/contracts`：统一成功/错误响应与错误码。
- `src/server/services`：结账、订单状态、依赖保护、后台任务等业务规则。
- `src/server/repositories`：Prisma 数据访问封装。
- `src/server/auth`：会话、认证和 RBAC。
- `src/server/payments`：支付 provider、工厂和通知处理。
- `prisma`：数据模型、迁移和受环境变量控制的种子。

API 成功响应采用 `{ success: true, data, meta? }`；错误响应采用 `{ success: false, error: { code, message } }`。兼容接口可能保留旧顶层字段。
