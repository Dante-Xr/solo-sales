<!--
修改时间：2026-06-05 11:39:06 +08:00
修改内容：同步 README 中项目版本说明，明确 README、发布文档与 package 版本标识统一为 1.5.0。
修改模型：gpt-5.5
-->

# SoloSales

[![Version](https://img.shields.io/badge/version-1.5.0-blue.svg)](https://github.com/Dante-Xr/solo-sales)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB.svg)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2A52BE.svg)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)

SoloSales 是一个基于 Next.js 16 App Router 的全栈独立站电商项目。它采用模块化单体架构，前台商城、后台管理、支付、订单、商品、营销、积分、联盟分销、数据分析、RAG 智能客服和运维验证脚本都在同一个代码库内交付。

当前 README 反映 v1.5 状态：项目已完成 `src/server` 服务端分层、统一 API 响应契约、交易幂等、依赖故障快速失败、高频读缓存、后台任务队列准备、smoke/synthetic 验证和最小压测基线。

说明：README badge、`CHANGELOG.md`、`RELEASES.md`、`package.json` 与 `package-lock.json` 的项目版本标识已统一为 `1.5.0`。

## 当前状态

| 项目 | 状态 |
|------|------|
| 架构形态 | 模块化单体，不做微服务拆分 |
| 前端 | Next.js 16 + React 19 + Tailwind CSS 4 |
| 后端 | Next.js Route Handlers + `src/server` services/repositories/contracts |
| 数据库 | PostgreSQL / Neon + Prisma |
| 缓存 | Upstash Redis |
| 支付 | Stripe + PayPal |
| 后台 | Refine + Tremor + RBAC |
| 国际化 | `next-intl`，中英文路由 |
| 验证 | Jest、TypeScript、ESLint、Next build、smoke/synthetic、perf baseline |

## 核心能力

### 前台商城

- 多语言首页、商品列表、商品详情、搜索、购物车、订单、个人资料页面。
- Zustand 管理购物车和前台状态。
- 商品列表、featured 商品和首页商品读取已接入服务层与缓存策略。
- 数据库不可达时，前台关键页面可使用兜底商品避免页面 500。
- 移动端底部导航、响应式商品网格、统一 Storefront 布局、主题切换和视口模式切换。

### 订单与支付

- 订单金额由服务端按数据库商品价格计算，不信任客户端传入金额。
- 下单过程在事务内处理库存扣减。
- `/api/orders` 支持 `Idempotency-Key`，重复请求可重放既有订单结果。
- Stripe Checkout 使用数据库商品价格创建支付会话。
- Stripe Webhook 支持签名校验、订单/支付事务写入、重复投递幂等处理。
- `Payment(provider, transactionId)` 唯一约束用于支付流水去重。
- PayPal checkout 保留演示/校验路径并统一标准响应。

### 商品、促销与库存

- 商品、分类、featured、批量更新、批量删除迁移到 `product-service`。
- 优惠券、积分账户、积分获取、积分兑换、积分流水迁移到 `promotion-service`。
- 批发商品导入、导入日志、SKU 去重、库存预警迁移到 `inventory-service`。
- `/api/import` 默认同步导入，也支持 `execution: "async"` 入队后台任务。

### 后台管理

- 后台管理路径位于 `/[locale]/admin/*`。
- 支持仪表盘、商品、订单、客户、导入、知识库、客服、角色、权限、管理员用户、个人资料和系统设置。
- 后台 RBAC 包含 `Permission`、`Role`、`AdminUser` 和 `PermissionLog`。
- 后台 dashboard 高频聚合已接入缓存和依赖故障保护。

### 营销与增长

- 优惠券和积分系统。
- 联盟分销：分销商、推广链接、佣金和提现。
- 商品套餐：套餐、套餐商品、套餐验证。
- 遗弃购物车记录与后续营销链路。
- 邮件序列模型和触发 API。

### RAG 智能客服

- 知识库分类、知识条目和版本历史。
- 客服对话、上下文脱敏、AI 客服客户端配置。
- Chat API 和 feedback API 统一标准响应。

### 高并发准备能力 v1.5

v1.5 不承诺 10 万 QPS 生产容量。该版本的目标是建立高并发前置能力和可验证门禁。

- `dependency-guard`: 统一数据库、Redis、外部依赖的超时、有限重试、快速失败和错误映射。
- 交易域幂等: 下单幂等键、支付 webhook 幂等、库存竞争测试。
- 高频读治理: 商品列表、featured、storefront 商品和后台 dashboard 缓存。
- smoke/synthetic: 覆盖关键页面、API、支付负向路径和依赖故障契约。
- background jobs: 新增 `BackgroundJob` 通用后台任务表和服务层。
- perf baseline: 最小压测脚本输出 QPS、P95/P99、错误率、503 比例、缓存命中率、依赖耗时和队列堆积观测值。

## 技术栈

| 类别 | 技术 |
|------|------|
| Framework | Next.js 16 App Router, Turbopack |
| UI | React 19, Tailwind CSS 4, shadcn/ui, Base UI, Lucide |
| Admin | Refine, Tremor, Recharts |
| State | Zustand, TanStack Query |
| i18n | next-intl |
| Auth | Better Auth |
| Database | PostgreSQL / Neon, Prisma 5 |
| Cache | Upstash Redis |
| Payments | Stripe, PayPal |
| Validation | Zod |
| Monitoring | Sentry |
| Tests | Jest, Testing Library, Playwright dependency installed |

## 架构

```text
Next.js App Router
├─ src/app/[locale]          前台和后台页面
├─ src/app/api               Route Handlers
├─ src/server/contracts      API 响应契约和错误模型
├─ src/server/services       业务服务层
├─ src/server/repositories   Prisma 数据访问封装
├─ src/server/auth           服务端会话和鉴权
├─ src/server/payments       Stripe SDK 封装
├─ src/lib                   客户端工具、Refine 适配、领域辅助服务
├─ src/components            前台、后台、结账、商品、客服和 UI 组件
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

## 目录结构

```text
solo_sales/
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  ├─ seed-admin.ts
│  └─ seed-products.ts
├─ scripts/
│  ├─ smoke-synthetic.mjs
│  ├─ load-baseline.mjs
│  └─ __tests__/
├─ src/
│  ├─ app/
│  │  ├─ [locale]/
│  │  └─ api/
│  ├─ components/
│  ├─ hooks/
│  ├─ i18n/
│  ├─ lib/
│  ├─ middleware/
│  ├─ server/
│  └─ stores/
├─ CHANGELOG.md
├─ RELEASES.md
├─ next.config.ts
├─ jest.config.ts
├─ eslint.config.mjs
├─ netlify.toml
└─ package.json
```

## 主要 API

| 模块 | 路径 |
|------|------|
| 健康检查 | `GET /api/health` |
| CSRF | `GET /api/csrf-token` |
| 商品 | `/api/products`, `/api/products/[id]`, `/api/products/featured`, `/api/products/batch` |
| 分类 | `/api/categories` |
| 订单 | `/api/orders`, `/api/orders/[id]` |
| 支付 | `/api/checkout/stripe`, `/api/checkout/stripe/webhook`, `/api/checkout/paypal` |
| 优惠券 | `/api/coupons`, `/api/coupons/[id]`, `/api/coupons/validate` |
| 积分 | `/api/points`, `/api/points/earn`, `/api/points/redeem`, `/api/points/transactions` |
| 后台 | `/api/admin/*` |
| 分析 | `/api/analytics/*` |
| 导入 | `/api/import`, `/api/import/logs` |
| 知识库 | `/api/knowledge`, `/api/knowledge/[id]`, `/api/knowledge/categories` |
| 客服 | `/api/chat`, `/api/chat/feedback` |
| 联盟 | `/api/affiliates/*` |
| 套餐 | `/api/bundles/*` |
| 邮件序列 | `/api/sequences/*` |
| 库存预警 | `/api/stock-alert` |

## 数据模型摘要

| 领域 | 模型 |
|------|------|
| 用户认证 | `User`, `Session`, `Account`, `Verification` |
| 商品交易 | `Category`, `Product`, `Order`, `OrderItem`, `Payment` |
| 促销积分 | `Coupon`, `CouponUsage`, `LoyaltyProgram`, `CustomerPoints`, `PointTransaction` |
| 后台 RBAC | `Permission`, `Role`, `AdminUser`, `PermissionLog` |
| 知识库客服 | `KnowledgeCategory`, `KnowledgeBase`, `KnowledgeHistory`, `Conversation`, `ChatMessage` |
| 数据分析 | `DailySnapshot`, `ReportSchedule` |
| 导入库存 | `ImportLog`, `StockAlertLog` |
| 后台任务 | `BackgroundJob` |
| 增长营销 | `AbandonedCart`, `EmailSequence`, `EmailSequenceStep`, `EmailSequenceEnrollment`, `EmailSequenceLog` |
| 套餐分销 | `Bundle`, `BundleItem`, `BundleOrder`, `Affiliate`, `AffiliateLink`, `AffiliateCommission`, `AffiliatePayout` |
| 多币种 | `Currency`, `ExchangeRate`, `OrderCurrency` |

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

### 环境变量

项目会读取 `.env` / `.env.local`。常用变量如下：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL/Neon 连接字符串 |
| `BETTER_AUTH_URL` | 应用访问地址 |
| `BETTER_AUTH_SECRET` | Better Auth 密钥 |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token |
| `STRIPE_SECRET_KEY` | Stripe Secret Key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret |
| `PAYPAL_CLIENT_ID` | PayPal Client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal Client Secret |
| `WHOLESALER_1866_API_KEY` | 1866 批发商 API Key |
| `SENTRY_DSN` | Sentry DSN |

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

默认管理员：

| 邮箱 | 密码 |
|------|------|
| `admin@solosales.com` | `Admin@123456` |

生产环境必须修改默认管理员密码。

## 脚本命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Next.js 开发服务器 |
| `npm run build` | `prisma generate` 后执行生产构建 |
| `npm start` | 启动生产服务器 |
| `npm run lint` | ESLint 检查 |
| `npm test` | Jest 测试 |
| `npm run test:watch` | Jest watch |
| `npm run smoke:synthetic` | 关键页面/API/负向路径 synthetic 验证 |
| `npm run perf:baseline` | 最小压测和观测基线 |
| `npm run analyze` | Bundle 分析 |

## 验证基线

当前 v1.5 最近一次本地验证结果：

- Prisma validate/generate passed.
- TypeScript `tsc --noEmit` passed.
- ESLint passed.
- Jest passed: 41 suites / 179 tests.
- Next.js production build passed.

建议发布前至少执行：

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm test -- --runInBand
npm run build
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

## 部署说明

项目包含 `netlify.toml`，可部署到 Netlify，也可部署到支持 Next.js 16 的平台。生产环境需要确保：

- `DATABASE_URL` 可访问。
- Prisma migration 已执行。
- Redis 配置可用。
- Better Auth URL/Secret 与生产域名匹配。
- Stripe webhook endpoint 与 `STRIPE_WEBHOOK_SECRET` 匹配。
- 默认管理员密码已修改。

## 安全与稳定性

- Better Auth 数据库会话。
- RBAC 后台权限模型。
- API 输入使用 Zod 校验。
- 注册、支付、搜索等路径有限流。
- CSRF token API 和受保护写路径。
- Stripe webhook 签名校验。
- 订单金额服务端计算。
- 外部依赖统一故障映射。
- 商品和 dashboard 高频读缓存。
- 后台重任务可入队，支持重试和死信状态。

## 更新日志

详细版本记录见：

- [CHANGELOG.md](./CHANGELOG.md)
- [RELEASES.md](./RELEASES.md)

## 已知说明

- v1.5 不承诺 10 万 QPS，只建立高并发准备能力和验证门禁。
- `.trae/documents`、`.trae/specs`、`.trae/plans` 为本地规划资料，默认被 git 忽略。
- `.codex/agents` 是本地 agent 配置，不属于项目运行必需文件。
- Playwright 依赖已存在，但当前高优先级验证仍以 Jest、build、smoke/synthetic 和 baseline 脚本为主。

## License

MIT
