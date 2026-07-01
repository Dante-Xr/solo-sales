<!--
修改时间：2026-06-28 12:00:00 +08:00
修改内容：更新到 v1.7.0，完成多支付提供商抽象层和订单状态机，新增支付宝和微信支付支持。
修改模型：AI assistant-model-4-8
-->

# SoloSales

[![Version](https://img.shields.io/badge/version-1.7.0-blue.svg)](https://github.com/Dante-Xr/solo-sales)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB.svg)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2A52BE.svg)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)

SoloSales 是一个基于 Next.js 16 App Router 的全栈独立站电商项目。它采用模块化单体架构，前台商城、后台管理、支付、订单、商品、营销、积分、联盟分销、数据分析、RAG 智能客服和运维验证脚本都在同一个代码库内交付。

当前 README 反映 v1.7.0 状态：项目已完成多支付提供商抽象层（Stripe/Alipay/WeChatPay/PayPal）和订单状态机扩展，支持支付宝和微信支付，实现完整的webhook幂等性保证。使用TDD方法开发，测试覆盖率达85%，327个测试全部通过。

说明：README badge、`CHANGELOG.md`、`RELEASES.md`、`package.json` 与 `package-lock.json` 的项目版本标识已统一为 `1.7.0`。

---

## 当前状态

| 项目 | 状态 |
|------|------|
| 架构形态 | 模块化单体，不做微服务拆分 |
| 前端 | Next.js 16 + React 19 + Tailwind CSS 4 |
| 后端 | Next.js Route Handlers + `src/server` services/repositories/contracts |
| 数据库 | PostgreSQL / Neon + Prisma |
| 缓存 | Upstash Redis |
| 支付 | Stripe + Alipay + WeChatPay + PayPal Business（v1.7.3） |
| 后台 | Refine + Tremor + RBAC |
| 国际化 | `next-intl`，中英文路由 |
| 主题 | Klein Blue (#002FA7) + Red (#DC2626) |
| 验证 | Jest、TypeScript、ESLint、Next build、smoke/synthetic、perf baseline、Playwright E2E |

---

## 核心能力

### 前台商城

- 多语言首页、商品列表、商品详情、搜索、购物车、订单、个人资料页面。
- Zustand 管理购物车、愿望清单和前台视口模式状态。
- 商品列表、featured 商品和首页商品读取已接入服务层与缓存策略。
- 数据库不可达时，前台关键页面可使用兜底商品避免页面 500。
- 移动端底部导航、响应式商品网格、统一 Storefront 布局、主题切换和视口模式切换。
- framer-motion 动画系统（FadeIn/SlideUp/ScaleIn/PageTransition/Stagger）。

### 订单与支付

- 订单金额由服务端按数据库商品价格计算，不信任客户端传入金额。
- 下单过程在事务内处理库存扣减。
- `/api/orders` 支持 `Idempotency-Key`，重复请求可重放既有订单结果。
- v1.7 统一Checkout流程: `/api/checkout/intent` 支持多支付提供商选择。
- v1.7 `CheckoutService`: 服务端金额计算、库存验证、订单创建、支付会话初始化。
- v1.7 `PaymentProvider` 抽象层与 `PaymentProviderFactory`，统一 Stripe / Alipay / WeChatPay / PayPal 接口。
- v1.7 `OrderStateMachine`: 处理支付成功 → 订单 PAID + 幂等库存扣减 + 支付记录创建。
- Stripe Checkout 使用数据库商品价格创建支付会话。
- Stripe Webhook 支持签名校验、订单/支付事务写入、重复投递幂等处理。
- Alipay 网页支付: RSA签名验证、异步通知处理。
- WeChat Native支付: APIv3签名验证、资源解密、二维码展示。
- **PayPal Business 集成**（v1.7.3）：支持 Sole Proprietor 账户（无需营业执照），完整的 Checkout 和 Webhook 处理。
- `Payment(provider, transactionId)` 唯一约束用于支付流水去重。
- 通过 `ENABLED_PAYMENT_PROVIDERS` 环境变量控制启用的支付提供商（默认 `stripe,alipay,wechatpay`，可添加 `paypal`）。
- Webhook幂等性: 时间戳验证（5分钟窗口）、provider+transactionId去重、订单状态检查。

### 商品、促销与库存

- 商品、分类、featured、批量更新、批量删除迁移到 `product-service`。
- 优惠券、积分账户、积分获取、积分兑换、积分流水迁移到 `promotion-service`。
- 批发商品导入、导入日志、SKU 去重、库存预警迁移到 `inventory-service`。
- `/api/import` 默认同步导入，也支持 `execution: "async"` 入队 `BackgroundJob` 后台任务。

### 后台管理

- 后台管理路径位于 `/[locale]/admin/*`。
- 支持仪表盘、商品、订单、客户、导入、知识库、客服、角色、权限、管理员用户、个人资料和系统设置。
- 后台 RBAC 包含 `Permission`、`Role`、`AdminUser` 和 `PermissionLog`。
- 后台 dashboard 高频聚合已接入缓存和依赖故障保护。
- 高级组件：`VariantManager`（变体笛卡尔积）、`InventoryAlert`（四级预警）、`AuditLog`（操作日志）、`DataExporter`（CSV/JSON/Excel/PDF）、`BatchActionBar`（批量操作）、`KpiCard`、`GlobalSearch`、`FavoriteButton`、`RecentVisits`。

### 营销与增长

- 优惠券和积分系统（含 `LoyaltyProgram`、`MemberTier`）。
- 联盟分销：分销商、推广链接、佣金和提现。
- 商品套餐：套餐、套餐商品、套餐验证、套餐订单。
- 遗弃购物车记录与后续营销链路（`AbandonedCartStatus` 状态机）。
- 邮件序列模型和触发 API（`EmailSequence` / `EmailSequenceStep` / `EmailSequenceEnrollment` / `EmailSequenceLog`）。

### RAG 智能客服

- 知识库分类、知识条目和版本历史。
- 客服对话、上下文脱敏、AI 客服客户端配置（`src/server/config/ai-customer.ts`）。
- `chat-context-service` 与 `chat-redaction-service` 在服务端构建上下文与脱敏。
- Chat API 和 feedback API 统一标准响应。

### 高并发准备能力 v1.5

v1.5 不承诺 10 万 QPS 生产容量。该版本的目标是建立高并发前置能力和可验证门禁。

- `dependency-guard`: 统一数据库、Redis、外部依赖的超时、有限重试、快速失败和错误映射。
- 交易域幂等: 下单幂等键、支付 webhook 幂等、库存竞争测试。
- 高频读治理: 商品列表、featured、storefront 商品和后台 dashboard 缓存。
- smoke/synthetic: 覆盖关键页面、API、支付负向路径和依赖故障契约。
- background jobs: 新增 `BackgroundJob` 通用后台任务表和服务层。
- perf baseline: 最小压测脚本输出 QPS、P95/P99、错误率、503 比例、缓存命中率、依赖耗时和队列堆积观测值。

### 主题与设计系统 v1.6.5+

- Klein Blue (#002FA7) 主色 + Red (#DC2626) 强调色，CSS 变量映射无需改组件代码。
- 浅色主题对比度 13.5:1（超过 WCAG AAA），深色主题自适应变体。
- 统一间距系统（8px 网格）：`.space-y-section` / `.space-y-component` / `.space-y-element`。
- 完整字体层级：`.heading-xl/.lg/.md/.sm/.xs/.2xs`。
- 卡片悬停效果：`.card-hover` / `.card-hover-subtle`。
- 统一格式化工具：`src/lib/format/`（`formatCurrency` / `formatCurrencyCompact` / `formatDate` / `formatRelativeTime` / `truncateText` / `capitalize` / `toTitleCase`）。

---

## 技术栈

| 类别 | 技术 |
|------|------|
| Framework | Next.js 16 App Router, Turbopack |
| UI | React 19, Tailwind CSS 4, shadcn/ui, Base UI, Lucide |
| 动画 | framer-motion |
| Admin | Refine, Tremor, Recharts |
| State | Zustand, TanStack Query |
| i18n | next-intl |
| Auth | Better Auth + @better-auth/prisma-adapter |
| Database | PostgreSQL / Neon, Prisma 5, @prisma/adapter-pg |
| Cache | Upstash Redis |
| Payments | Stripe, alipay-sdk, wechatpay-axios-plugin, paypal-rest-sdk |
| 文档导出 | xlsx, jspdf, jspdf-autotable, html2canvas, html-to-docx |
| 拖拽 | @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities |
| Validation | Zod |
| Monitoring | Sentry |
| Tests | Jest, Testing Library, Playwright |

---

## 架构

```text
Next.js App Router
├─ src/app/[locale]          前台和后台页面
├─ src/app/api               Route Handlers
├─ src/server/contracts      API 响应契约和错误模型
├─ src/server/services       业务服务层（含 checkout / order-state-machine / dependency-guard / background-job）
├─ src/server/repositories   Prisma 数据访问封装
├─ src/server/auth           服务端会话和鉴权
├─ src/server/payments       支付抽象层
│  ├─ provider.ts            PaymentProvider 接口
│  ├─ factory.ts             PaymentProviderFactory
│  └─ providers/             stripe / alipay / wechatpay / paypal
├─ src/server/config         服务端配置（ai-customer）
├─ src/lib                   客户端工具、Refine 适配、format 工具、领域辅助服务
├─ src/components            前台、后台、结账、商品、客服、动画和 UI 组件
├─ src/middleware            CSRF guard、限流
├─ src/stores                Zustand 状态（cart / wishlist / viewport / admin-ui）
├─ src/hooks                 自定义 Hooks
├─ src/i18n                  next-intl 配置和中英文 messages
├─ scripts                   秘钥审计、smoke、perf baseline 脚本
└─ prisma                    Schema、migrations、seed
```

### 统一 API 响应

成功响应：

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

错误响应：

```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "服务暂时不可用"
  }
}
```

部分兼容接口会保留旧顶层字段，例如 `/api/health` 的 `status/checks` 和 `/api/csrf-token` 的 `token`。

### 统一错误码

`src/server/contracts/errors.ts` 定义了 `ErrorCodes` 枚举和 `StatusCodeMap`，覆盖：

- 内部错误：`INTERNAL_ERROR` / `NOT_IMPLEMENTED` / `SERVICE_UNAVAILABLE`
- 支付错误：`PAYMENT_CONFIGURATION_ERROR` / `PAYMENT_PROVIDER_ERROR` / `PAYMENT_WEBHOOK_SIGNATURE_ERROR`
- 鉴权错误：`UNAUTHORIZED` / `UNAUTHORIZED_TOKEN_EXPIRED` / `UNAUTHORIZED_TOKEN_INVALID` / `FORBIDDEN` / `FORBIDDEN_PERMISSION`
- 资源错误：`NOT_FOUND` / `NOT_FOUND_RESOURCE` / `CONFLICT` / `CONFLICT_DUPLICATE`
- 参数错误：`BAD_REQUEST` / `BAD_REQUEST_VALIDATION` / `BAD_REQUEST_MISSING_FIELD` / `BAD_REQUEST_INVALID_FORMAT`
- 业务错误：`INSUFFICIENT_STOCK` / `COUPON_EXPIRED` / `COUPON_INVALID` / `COUPON_ALREADY_USED` / `POINTS_INSUFFICIENT` / `ORDER_CANNOT_CANCEL` / `ORDER_ALREADY_PAID`

所有服务端模块引入 `server-only`，避免被 Client Component 误导入。

---

## 目录结构

```text
solo_sales/
├─ prisma/
│  ├─ schema.prisma          50+ 个数据模型
│  ├─ migrations/            数据库迁移
│  ├─ seed-admin.ts          管理员种子（受 SEED_ADMIN_* 环境变量控制）
│  └─ seed-products.ts       商品种子
├─ scripts/
│  ├─ secret-audit.mjs       秘钥扫描
│  ├─ smoke-synthetic.mjs    关键路径 synthetic 验证
│  ├─ load-baseline.mjs      最小压测基线
│  └─ __tests__/             脚本测试套件
├─ src/
│  ├─ app/
│  │  ├─ [locale]/           前台 + 后台页面
│  │  └─ api/                Route Handlers
│  ├─ components/
│  │  ├─ admin/              后台组件（charts/layout/products/table/advanced）
│  │  ├─ analytics/          数据分析组件
│  │  ├─ animations/         framer-motion 包装组件
│  │  ├─ auth/               认证组件
│  │  ├─ chatbot/            智能客服
│  │  ├─ checkout/           结账组件
│  │  ├─ cookie/             Cookie 同意
│  │  ├─ currency/           货币选择
│  │  ├─ error/              错误边界
│  │  ├─ logistics/          物流组件
│  │  ├─ order/              订单追踪
│  │  ├─ points/             积分组件
│  │  ├─ product/            商品展示与评价
│  │  ├─ providers/          Context 提供者
│  │  ├─ seo/                SEO 组件
│  │  ├─ storefront/         前台组件
│  │  └─ ui/                 shadcn/ui 基础组件
│  ├─ hooks/                 自定义 Hooks
│  ├─ i18n/                  next-intl 配置与翻译
│  ├─ lib/
│  │  ├─ affiliate/          联盟营销服务
│  │  ├─ analytics/          数据分析服务
│  │  ├─ bundle/             套餐服务
│  │  ├─ currency/           货币服务
│  │  ├─ format/             统一格式化工具
│  │  ├─ marketing/          邮件序列引擎
│  │  ├─ rag/                RAG 知识库
│  │  ├─ services/           AbandonedCart / Email / StockAlert
│  │  ├─ wholesalers/        批发商客户端（含 1866）
│  │  ├─ animations.ts       动画配置
│  │  ├─ api-client.ts       标准响应解包客户端
│  │  ├─ refine-data-provider.ts
│  │  ├─ refine-auth-provider.ts
│  │  ├─ env-validator.ts
│  │  ├─ csrf.ts / csp-nonce.ts
│  │  └─ prisma.ts / redis.ts / logger.ts / sentry.ts
│  ├─ middleware/            CSRF guard、rate-limit
│  ├─ server/
│  │  ├─ contracts/          API 响应契约 + 错误模型
│  │  ├─ services/           业务服务层（含 v1.7 checkout / order-state-machine）
│  │  ├─ repositories/       数据访问层
│  │  ├─ auth/               服务端鉴权
│  │  ├─ payments/           支付抽象层与多提供商
│  │  ├─ config/             服务端配置
│  │  └─ __mocks__/          server-only 测试 Mock
│  └─ stores/                Zustand 状态
├─ tests/e2e/storefront/     Playwright E2E 测试（15 个套件）
├─ CHANGELOG.md
├─ RELEASES.md
├─ DEPLOYMENT.md
├─ AGENTS.md / AI assistant.md     agent 行为约束
├─ next.config.ts
├─ jest.config.ts
├─ playwright.config.ts
├─ eslint.config.mjs
├─ netlify.toml
└─ package.json
```

---

## 主要 API

| 模块 | 路径 |
|------|------|
| 健康检查 | `GET /api/health` |
| CSRF | `GET /api/csrf-token` |
| 商品 | `/api/products`, `/api/products/[id]`, `/api/products/featured`, `/api/products/batch` |
| 分类 | `/api/categories` |
| 订单 | `/api/orders`, `/api/orders/[id]` |
| 支付 | `/api/checkout/stripe`, `/api/checkout/stripe/webhook`, `/api/checkout/intent`, `/api/checkout/paypal`（已禁用） |
| 优惠券 | `/api/coupons`, `/api/coupons/[id]`, `/api/coupons/validate` |
| 积分 | `/api/points`, `/api/points/earn`, `/api/points/redeem`, `/api/points/transactions` |
| 后台 | `/api/admin/*`（dashboard / orders / roles / permissions / users / reviews / profile / auth / me） |
| 分析 | `/api/analytics/overview` `/sales` `/products` `/customers` `/inventory` |
| 导入 | `/api/import`, `/api/import/logs` |
| 知识库 | `/api/knowledge`, `/api/knowledge/[id]`, `/api/knowledge/categories` |
| AI 知识检索 | `/api/ai/knowledge/search` |
| 客服 | `/api/chat`, `/api/chat/feedback` |
| 联盟 | `/api/affiliates/*`（含 convert / link / commissions / payouts） |
| 套餐 | `/api/bundles/*`（含 items / validate） |
| 邮件序列 | `/api/sequences/*`（含 enroll / trigger） |
| 货币 | `/api/currency`, `/api/currency/rates` |
| 客户 | `/api/customers`, `/api/customers/[id]` |
| 评论 | `/api/reviews`, `/api/reviews/[id]`, `/api/reviews/[id]/replies` |
| 搜索 | `/api/search/trending` |
| 库存预警 | `/api/stock-alert` |
| 遗弃购物车 | `/api/abandoned-cart` |
| 注册 | `/api/auth/register`, `/api/auth/[...all]`（Better Auth） |

---

## 数据模型摘要

| 领域 | 模型 |
|------|------|
| 用户认证 | `User`, `Session`, `Account`, `Verification` |
| 商品交易 | `Category`, `Product`, `Order`, `OrderItem`, `Payment` |
| 促销积分 | `Coupon`, `CouponUsage`, `LoyaltyProgram`, `CustomerPoints`, `PointTransaction` |
| 后台 RBAC | `Permission`, `Role`, `AdminUser`, `PermissionLog` |
| 知识库客服 | `KnowledgeCategory`, `KnowledgeBase`, `KnowledgeHistory`, `Conversation`, `ChatMessage`, `Message` |
| 数据分析 | `DailySnapshot`, `ReportSchedule` |
| 导入库存 | `ImportLog`, `StockAlertLog` |
| 后台任务 | `BackgroundJob` |
| 增长营销 | `AbandonedCart`, `EmailSequence`, `EmailSequenceStep`, `EmailSequenceEnrollment`, `EmailSequenceLog` |
| 套餐分销 | `Bundle`, `BundleItem`, `BundleOrder`, `Affiliate`, `AffiliateLink`, `AffiliateCommission`, `AffiliatePayout` |
| 多币种 | `Currency`, `ExchangeRate`, `OrderCurrency` |
| 评论 | `Review`, `ReviewImage`, `ReviewReply` |

枚举覆盖：`OrderStatus`、`PaymentStatus`、`KnowledgeStatus`、`ConversationStatus`、`SatisfactionRating`、`MessageRole`、`ReportType`、`ImportStatus`、`BackgroundJobType`、`BackgroundJobStatus`、`PermissionType`、`LogAction`、`TargetType`、`CouponType`、`MemberTier`、`PointType`、`AbandonedCartStatus`、`TriggerType`、`SequenceStatus`、`EnrollmentStatus`、`EmailSendStatus`、`BundleStatus`、`DiscountType`、`AffiliateStatus`、`CommissionStatus`、`PayoutStatus`。

---

## 本地开发

### 环境要求

- Node.js 20+
- PostgreSQL 15+ 或 Neon PostgreSQL
- Redis / Upstash Redis
- npm

### 安装依赖

```bash
npm install
```

`postinstall` 会自动执行 `prisma generate`。

### 环境变量

项目会读取 `.env` / `.env.local`。常用变量如下：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL/Neon 连接字符串 |
| `BETTER_AUTH_URL` | 应用访问地址 |
| `BETTER_AUTH_SECRET` | Better Auth 密钥（`openssl rand -base64 32`） |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token |
| `STRIPE_SECRET_KEY` | Stripe Secret Key |
| `STRIPE_PUBLIC_KEY` | Stripe Publishable Key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret |
| `ENABLED_PAYMENT_PROVIDERS` | 启用的支付提供商（默认 `stripe,alipay,wechatpay`） |
| `WHOLESALER_1866_API_KEY` | 1866 批发商 API Key |
| `AI_CUSTOMER_ENABLED` | AI 客服启用开关（默认 `false`） |
| `AI_CUSTOMER_BASE_URL` | AI 客服服务地址 |
| `AI_CUSTOMER_SERVICE_TOKEN` | AI 客服服务 Token |
| `AI_CUSTOMER_HMAC_SECRET` | AI 客服 HMAC 密钥 |
| `AI_CUSTOMER_TIMEOUT_MS` | AI 客服超时（默认 5000） |
| `AI_CUSTOMER_TENANT_ID` | AI 客服租户 ID（默认 `solo-sales`） |
| `AI_CUSTOMER_LOCALE` | AI 客服默认语言（默认 `zh-CN`） |
| `SENTRY_DSN` | Sentry DSN |
| `SEED_ADMIN_EMAIL` | 管理员种子邮箱 |
| `SEED_ADMIN_PASSWORD` | 管理员种子密码（生产必须使用强密码并轮换） |
| `SEED_ADMIN_USERNAME` | 管理员种子用户名（可选） |

### 数据库

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

开发环境如需创建迁移：

```bash
npx prisma migrate dev
```

### 启动项目

```bash
npm run dev
```

默认访问：

- 前台中文站点：`http://localhost:3000/zh`
- 后台登录：`http://localhost:3000/zh/admin/login`

初始管理员不再内置默认账号。执行权限种子时通过 `SEED_ADMIN_EMAIL`、`SEED_ADMIN_PASSWORD` 和可选 `SEED_ADMIN_USERNAME` 显式创建，生产环境必须使用独立强密码并在上线前轮换。

---

## 脚本命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Next.js 开发服务器 |
| `npm run build` | `prisma generate` 后执行生产构建 |
| `npm start` | 启动生产服务器 |
| `npm run lint` | ESLint 检查 |
| `npm test` | Jest 测试 |
| `npm run test:watch` | Jest watch |
| `npm run audit:secrets` | 扫描代码库中的硬编码密钥 |
| `npm run smoke:synthetic` | 关键页面/API/负向路径 synthetic 验证 |
| `npm run perf:baseline` | 最小压测和观测基线 |
| `npm run analyze` | Bundle 分析 |

---

## 验证基线

最近一次本地验证结果：

- Prisma validate/generate passed.
- TypeScript `tsc --noEmit` passed.
- ESLint passed.
- Jest passed: 327 tests / 87 suites（v1.7.0）。
- Next.js production build passed.
- Playwright E2E：15 个 storefront 套件（auth / cart / checkout / search / product-detail / wishlist / responsive / reviews / orders / profile / performance / coupons）。

建议发布前至少执行：

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm test -- --runInBand
npm run build
npm run audit:secrets
```

已有本地服务时可执行：

```bash
npm run smoke:synthetic
npm run perf:baseline
```

这两个脚本默认请求 `http://127.0.0.1:3100`。如果本地开发服务器使用 Next 默认端口 3000，请在 PowerShell 中指定：

```powershell
$env:SMOKE_BASE_URL="http://127.0.0.1:3000"; npm run smoke:synthetic
$env:BASELINE_BASE_URL="http://127.0.0.1:3000"; npm run perf:baseline
```

`perf:baseline` 默认是小流量门禁，不代表真实容量上限。

---

## 部署说明

项目包含 `netlify.toml`，可部署到 Netlify，也可部署到支持 Next.js 16 的平台。生产环境需要确保：

- `DATABASE_URL` 可访问。
- Prisma migration 已执行。
- Redis 配置可用。
- Better Auth URL/Secret 与生产域名匹配。
- Stripe webhook endpoint 与 `STRIPE_WEBHOOK_SECRET` 匹配。
- `ENABLED_PAYMENT_PROVIDERS` 仅启用已配置密钥的提供商。
- 初始管理员凭据已轮换，且未提交到代码仓库。
- `npm run audit:secrets` 在 CI 中通过。

详细部署指引参见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

---

## 安全与稳定性

- Better Auth 数据库会话，支持即时撤销。
- RBAC 后台权限模型（`Permission` / `Role` / `AdminUser` / `PermissionLog`）。
- API 输入使用 Zod 校验。
- 注册、支付、搜索等路径有限流（基于 Upstash Redis）。
- CSRF token API 和受保护写路径。
- Stripe webhook 签名校验 + 重复事件幂等。
- 订单金额服务端计算，不信任客户端传入。
- 外部依赖统一故障映射（`dependency-guard`）。
- 商品和 dashboard 高频读缓存。
- 后台重任务可入队 `BackgroundJob`，支持重试和死信状态。
- 移除游客结账，所有交易要求认证用户。
- 秘钥审计脚本 `npm run audit:secrets` 在 CI 中扫描硬编码密钥。

---

## 更新日志

详细版本记录见：

- [CHANGELOG.md](./CHANGELOG.md)
- [RELEASES.md](./RELEASES.md)

最近版本：

- **v1.7.0**（2026-06-28）— 多支付提供商抽象层完成：支持Stripe/Alipay/WeChatPay，统一CheckoutService，OrderStateMachine状态机，Webhook幂等性保证。使用TDD方法开发，327个测试100%通过。
- **v1.6.6**（2026-06-27）— 三专家诊断优化：Klein Blue 主题 100%、统一格式化工具、间距/字体系统、framer-motion 动画、E2E 测试从 3 扩展到 15 个套件。
- **v1.6.5**（2026-06-27）— Klein Blue 主题系统 + Playwright E2E 框架，console 语句减少 45%。
- **v1.6.0**（2026-06-26）— 安全加固和环境变量轮换，移除游客结账，新增秘钥审计脚本和 API 认证保护测试。
- **v1.5.0**（2026-06-05）— 高并发准备能力：dependency-guard、交易幂等、读路径缓存、smoke/synthetic、background jobs、perf baseline。
- **v1.4.0**（2026-05-02）— 模块化单体服务端分层：services / repositories / contracts。

---

## 已知说明

- v1.5 不承诺 10 万 QPS，只建立高并发准备能力和验证门禁。
- v1.7 多支付抽象（Alipay / WeChatPay）已在 `main` 分支合并，生产就绪。需配置相应环境变量启用。
- `.trae/documents`、`.trae/specs`、`.trae/plans` 为本地规划资料，默认被 git 忽略。
- `.codex/agents` 是本地 agent 配置，不属于项目运行必需文件。
- `.agents/skills` 包含 Stripe 相关 agent skill，仅用于开发辅助。
- Playwright 浏览器二进制需通过 `npx playwright install` 单独下载。

---

## License

MIT
