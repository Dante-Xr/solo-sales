<!--
修改时间：2026-05-02 18:13:41 +08:00
修改内容：新增服务端模块边界说明，约定 contracts/services/repositories/auth/payments 分层职责。
修改模型：gpt-5.5
-->

# Server Module Boundary

`src/server` contains application code that must only run on the server:

- `contracts`: HTTP response and error contracts used by route handlers.
- `services`: business workflows such as order creation and Stripe payments.
- `repositories`: Prisma data access helpers.
- `auth`: server-side auth/session helpers.
- `payments`: payment provider clients and provider-specific utilities.

Every runtime module in this tree imports `server-only` so accidental imports from Client Components fail during build.
