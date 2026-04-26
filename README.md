# SoloSales - 独立站电商系统

[![版本](https://img.shields.io/badge/version-1.2.0-blue.svg)](https://github.com/Dante-Xr/solo-sales)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2A52BE.svg)](https://prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

SoloSales 是一个现代化的独立站电商系统，基于 Next.js 16 App Router 构建，支持前后台一体化。涵盖商品展示、购物车、订单管理、支付集成、智能客服（RAG）、联盟营销、积分系统，以及完整的 RBAC 后台管理系统。

---

## 技术栈

### 核心框架

| 类别 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Next.js (App Router + Turbopack) | 16.2.1 |
| UI 框架 | React | 19.2.4 |
| 语言 | TypeScript | 5.x |

### 数据与后端

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 数据库 | PostgreSQL (Neon) | - | Serverless PostgreSQL |
| ORM | Prisma | 5.22.0 | 含 `@prisma/adapter-pg` |
| 缓存 | Upstash Redis | 1.37.0 | 分布式缓存 + 限流 |
| 认证 | Better Auth | 1.6.2 | 替代 NextAuth，支持 admin 插件 |

### UI 与样式

| 类别 | 技术 | 版本 |
|------|------|------|
| 样式框架 | Tailwind CSS | 4.x |
| UI 组件库 | shadcn/ui | 4.1.0 |
| 基础组件 | @base-ui/react | 1.3.0 |
| 图表可视化 | Recharts | 3.8.0 |
| 数据面板 | @tremor/react | 4.0.0-beta |
| 图标库 | Lucide React | 0.577.0 |
| 动画 | Tw Animate CSS | 1.4.0 |
| 轮播 | Embla Carousel | 8.6.0 |

### 状态管理与数据

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 客户端状态 | Zustand | 5.0.12 | 购物车、愿望清单、视口模式 |
| 服务端状态 | TanStack React Query | 5.95.2 | 数据请求与缓存 |
| 后台框架 | Refine | 5.0.12 | 管理后台 CRUD 框架 |

### 业务与工具

| 类别 | 技术 | 版本 |
|------|------|------|
| 国际化 | next-intl | 4.9.1 |
| 表单验证 | Zod | 4.3.6 |
| 支付集成 | Stripe / PayPal | 20.4.1 / 1.8.1 |
| 错误监控 | Sentry | 10.46.0 |
| 打包分析 | @next/bundle-analyzer | 16.2.1 |
| 日期处理 | date-fns | 4.1.0 |

---

## 功能模块

### 前台商城

| 模块 | 功能描述 |
|------|----------|
| **商品展示** | 商品列表、详情页、品牌展示，支持分类筛选和搜索 |
| **购物车** | Zustand 持久化购物车，支持增减数量、删除、折扣码应用 |
| **用户认证** | Better Auth 邮箱注册登录、访客结账、管理员插件 |
| **订单管理** | 订单创建、支付、状态追踪、物流信息展示 |
| **多语言** | next-intl 国际化支持（中英文切换，默认中文） |
| **主题切换** | 亮色/暗色主题切换 (next-themes) |
| **PWA 支持** | 渐进式应用支持 |
| **多币种** | 实时汇率转换 (CurrencyService) |

### 支付集成

| 支付方式 | 状态 | 说明 |
|----------|------|------|
| Stripe | ✅ 已集成 | 支持信用卡、借记卡支付 |
| PayPal | ✅ 已集成 | 支持 PayPal 账户支付 |
| 折扣码 | ✅ 已集成 | Stripe Coupon 折扣系统 |

### 智能客服 (RAG)

| 模块 | 功能描述 |
|------|----------|
| **知识库管理** | 后台管理知识库分类、文章、标签、版本控制 |
| **意图识别** | IntentDetection - 识别用户查询意图 |
| **对话管理** | ConversationManager - 管理客服会话 |
| **RAG 检索** | RAGService - 基于向量检索的智能问答 |

### 营销模块

| 模块 | 功能描述 |
|------|----------|
| **邮件序列** | EmailSequenceEngine - 自动化邮件序列引擎 |
| **遗弃购物车** | AbandonedCartService - 购物车遗弃提醒 |
| **库存预警** | StockAlertService - 库存不足提醒 |
| **积分系统** | 积分获取、兑换、余额查询、交易记录 |
| **联盟营销** | AffiliateService - 佣金管理、链接追踪、佣金结算 |
| **套餐销售** | BundleService - 商品套餐管理、套餐验证 |

### 数据分析

| 模块 | 功能描述 |
|------|----------|
| **销售概览** | AnalyticsService - 销售数据统计 |
| **客户分析** | 客户数量、留存、行为分析 |
| **商品分析** | 商品销量、热度、库存分析 |
| **库存分析** | InventoryAnalytics - 库存预警分析 |

### 后台管理系统

| 模块 | 功能描述 |
|------|----------|
| **仪表盘** | Tremor 数据面板、销售数据可视化、图表统计 |
| **商品管理** | Refine CRUD、库存管理、图片管理 |
| **订单管理** | 订单列表、状态管理、订单详情 |
| **客户管理** | 客户信息、订单历史、积分查看 |
| **权限管理** | RBAC 权限系统 - 角色、权限、用户管理 |
| **知识库管理** | RAG 知识库内容的增删改查 |
| **商品导入** | 批发商 API 导入（支持 1866 批发商） |
| **客服聊天** | 管理员客服会话界面 |
| **系统设置** | 系统配置管理 |

### 批发商集成

| 批发商 | 状态 | 功能 |
|--------|------|------|
| 1866 批发商 | ✅ 已集成 | API 导入、数据映射、去重处理 |

### API 服务

| 模块 | 功能描述 |
|------|----------|
| **健康检查** | `/api/health` - 服务健康状态 |
| **货币服务** | CurrencyService - 实时汇率获取与转换 |
| **评论管理** | 商品评论、回复、审核 |
| **搜索服务** | 热门搜索、趋势搜索 |

---

## 项目结构

```
solo_sales/
├── prisma/
│   ├── schema.prisma              # Prisma 数据模型定义
│   ├── seed-admin.ts              # 管理员数据初始化脚本
│   └── migrations/                # 数据库迁移文件
│
├── public/
│   ├── manifest.json              # PWA 清单
│   └── sw.js                      # Service Worker
│
├── src/
│   ├── app/
│   │   ├── [locale]/              # 国际化路由 (next-intl)
│   │   │   ├── admin/             # 后台管理系统
│   │   │   │   ├── (auth)/login/  # 管理员登录页
│   │   │   │   ├── chat/          # 客服聊天页面
│   │   │   │   ├── customers/     # 客户管理
│   │   │   │   ├── import/        # 商品导入
│   │   │   │   ├── knowledge/     # 知识库管理
│   │   │   │   ├── orders/        # 订单管理
│   │   │   │   ├── permissions/   # 权限管理
│   │   │   │   ├── products/      # 商品管理
│   │   │   │   ├── profile/       # 个人资料
│   │   │   │   ├── roles/         # 角色管理
│   │   │   │   ├── settings/      # 系统设置
│   │   │   │   └── users/         # 用户管理
│   │   │   ├── cart/              # 购物车页面
│   │   │   ├── demo/              # 演示页面
│   │   │   ├── orders/            # 订单页面
│   │   │   ├── product/[id]/      # 商品详情页
│   │   │   ├── profile/           # 用户资料页
│   │   │   ├── search/            # 搜索结果页
│   │   │   ├── layout.tsx         # 前台布局
│   │   │   └── page.tsx           # 首页
│   │   │
│   │   ├── api/                   # API 路由 (50+ 端点)
│   │   │   ├── abandoned-cart/    # 遗弃购物车
│   │   │   ├── admin/             # 后台管理 API
│   │   │   ├── affiliates/        # 联盟营销 API
│   │   │   ├── analytics/         # 数据分析 API
│   │   │   ├── auth/              # 用户认证 API
│   │   │   ├── bundles/           # 套餐 API
│   │   │   ├── categories/        # 商品分类
│   │   │   ├── chat/              # 客服聊天
│   │   │   ├── checkout/          # 支付 API (Stripe/PayPal)
│   │   │   ├── coupons/           # 折扣码 API
│   │   │   ├── currency/          # 货币服务
│   │   │   ├── customers/         # 客户 API
│   │   │   ├── health/            # 健康检查
│   │   │   ├── import/            # 商品导入
│   │   │   ├── knowledge/         # 知识库 API
│   │   │   ├── orders/            # 订单 API
│   │   │   ├── points/            # 积分 API
│   │   │   ├── products/          # 商品 API
│   │   │   ├── reviews/           # 评论 API
│   │   │   ├── search/            # 搜索 API
│   │   │   ├── sequences/         # 邮件序列 API
│   │   │   └── stock-alert/       # 库存预警
│   │   │
│   │   ├── globals.css            # 全局样式
│   │   └── favicon.ico            # 网站图标
│   │
│   ├── components/
│   │   ├── admin/                 # 后台管理组件 (Refine)
│   │   ├── analytics/             # 数据分析组件
│   │   ├── auth/                  # 认证组件
│   │   ├── chatbot/               # 智能客服组件
│   │   ├── checkout/              # 结账组件
│   │   ├── cookie/                # Cookie 同意组件
│   │   ├── currency/              # 货币选择组件
│   │   ├── error/                 # 错误边界
│   │   ├── logistics/             # 物流组件
│   │   ├── order/                 # 订单组件
│   │   ├── points/                # 积分组件
│   │   ├── product/               # 商品展示组件
│   │   ├── providers/             # Context 提供者 (Auth, Query, Theme)
│   │   ├── seo/                   # SEO 组件
│   │   ├── storefront/            # 商城前台组件
│   │   └── ui/                    # 基础 UI 组件 (shadcn/ui)
│   │
│   ├── hooks/                     # 自定义 Hooks
│   │   ├── use-mobile.ts          # 移动端检测
│   │   ├── useCurrency.ts         # 货币 Hook
│   │   ├── useOrders.ts           # 订单数据 Hook
│   │   ├── useProducts.ts         # 商品数据 Hook
│   │   ├── usePWA.ts              # PWA Hook
│   │   ├── usePermissions.tsx     # 权限 Hook
│   │   ├── usePullToRefresh.ts    # 下拉刷新 Hook
│   │   └── useTrending.ts         # 趋势搜索 Hook
│   │
│   ├── i18n/
│   │   ├── messages/              # 翻译文件 (en.json, zh.json)
│   │   ├── navigation.ts          # 国际化导航
│   │   ├── request.ts             # 请求配置
│   │   └── routing.ts             # 路由配置 (en, zh)
│   │
│   ├── lib/
│   │   ├── affiliate/             # 联盟营销服务
│   │   ├── analytics/             # 数据分析服务
│   │   ├── bundle/                # 套餐服务
│   │   ├── currency/              # 货币服务
│   │   ├── marketing/             # 营销引擎
│   │   │   └── EmailSequenceEngine.ts
│   │   ├── rag/                   # RAG 知识库
│   │   │   ├── ConversationManager.ts
│   │   │   ├── IntentDetection.ts
│   │   │   └── RAGService.ts
│   │   ├── services/              # 业务服务
│   │   │   ├── AbandonedCartService.ts
│   │   │   ├── EmailService.ts
│   │   │   └── StockAlertService.ts
│   │   ├── wholesalers/           # 批发商客户端
│   │   │   └── 1866/              # 1866 批发商实现
│   │   ├── adminAuth.ts           # 管理员认证
│   │   ├── api-client.ts          # API 客户端
│   │   ├── auth.ts                # Better Auth 配置
│   │   ├── auth-client.ts         # 认证客户端
│   │   ├── cache.ts               # 缓存工具
│   │   ├── env-validator.ts       # 环境变量验证
│   │   ├── prisma.ts              # Prisma 客户端
│   │   ├── redis.ts               # Redis 客户端
│   │   ├── refine-auth-provider.ts # Refine 认证适配
│   │   ├── refine-data-provider.ts # Refine 数据适配
│   │   ├── sentry.ts              # Sentry 配置
│   │   ├── utils.ts               # 通用工具函数
│   │   └── validators.ts          # Zod 验证器
│   │
│   ├── middleware/
│   │   └── rate-limit.ts          # API 限流中间件
│   │
│   └── stores/                    # Zustand 状态管理
│       ├── useCartStore.ts        # 购物车状态
│       ├── useViewportModeStore.ts # 视口模式状态
│       └── useWishlistStore.ts    # 愿望清单状态
│
├── .trae/                         # 项目文档与规格
│   ├── documents/                 # 需求与计划文档
│   ├── plans/                     # 优化计划
│   └── specs/                     # 详细规格说明
│
├── netlify.toml                   # Netlify 部署配置
├── next.config.ts                 # Next.js 配置
├── sentry.client.config.ts        # Sentry 客户端配置
├── sentry.server.config.ts        # Sentry 服务端配置
├── jest.config.ts                 # Jest 测试配置
├── eslint.config.mjs              # ESLint 配置
├── postcss.config.mjs             # PostCSS 配置
├── components.json                # shadcn/ui 配置
└── package.json                   # 项目依赖
```

---

## 数据库模型

### 核心业务模型

| 模型 | 说明 |
|------|------|
| `User` | 用户模型（含 Better Auth 会话、账户关联） |
| `Category` | 商品分类 |
| `Product` | 商品（含 SKU 支持批发导入，复合索引优化） |
| `Order` | 订单（含多币种支持） |
| `OrderItem` | 订单明细 |
| `Payment` | 支付记录 |

### 扩展业务模型

| 模型 | 说明 |
|------|------|
| `CustomerPoints` | 客户积分 |
| `PointsTransaction` | 积分交易记录 |
| `Affiliate` | 联盟商信息 |
| `AffiliateLink` | 推广链接 |
| `AffiliateCommission` | 佣金记录 |
| `AffiliatePayout` | 佣金提现 |
| `Coupon` | 折扣码 |
| `CouponUsage` | 折扣码使用记录 |
| `Bundle` | 套餐 |
| `BundleItem` | 套餐商品项 |
| `Review` | 商品评论 |
| `ReviewReply` | 评论回复 |
| `CurrencyRate` | 货币汇率缓存 |
| `AbandonedCart` | 遗弃购物车 |
| `EmailSequence` | 邮件序列 |
| `EmailSequenceEnrollment` | 序列 enrollment |

### RAG 知识库模型

| 模型 | 说明 |
|------|------|
| `KnowledgeCategory` | 知识库分类（支持多级） |
| `KnowledgeBase` | 知识库条目 |
| `KnowledgeHistory` | 知识库版本历史 |

### 权限管理模型

| 模型 | 说明 |
|------|------|
| `Permission` | 权限定义（页面/操作） |
| `Role` | 角色（关联权限集合） |
| `AdminUser` | 管理员用户 |

### 日志与导入

| 模型 | 说明 |
|------|------|
| `ImportLog` | 批发商品导入日志 |
| `Message` | 客服消息 |
| `ChatFeedback` | 聊天反馈 |
| `PermissionLog` | 权限操作日志 |

### Better Auth 模型

| 模型 | 说明 |
|------|------|
| `Session` | 用户会话（数据库存储，支持即时撤销） |
| `Account` | 第三方账户关联 |

---

## API 概览

### 认证 API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| ANY | `/api/auth/[...all]` | Better Auth 认证回调 |
| POST | `/api/admin/auth` | 管理员登录 |
| GET | `/api/admin/auth/me` | 获取当前管理员 |

### 商城 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/products` | 商品列表/创建 |
| GET | `/api/products/[id]` | 商品详情 |
| GET | `/api/products/featured` | 推荐商品 |
| POST | `/api/products/batch` | 批量商品操作 |
| GET/POST | `/api/categories` | 分类列表/创建 |
| GET/POST | `/api/orders` | 订单列表/创建 |
| GET | `/api/orders/[id]` | 订单详情 |
| GET | `/api/search/trending` | 热门搜索 |
| POST | `/api/checkout/stripe` | Stripe 支付 |
| POST | `/api/checkout/paypal` | PayPal 支付 |
| GET/POST | `/api/coupons` | 折扣码管理 |
| POST | `/api/coupons/validate` | 折扣码验证 |

### 积分系统 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/points` | 积分余额查询 |
| POST | `/api/points/earn` | 积分获取 |
| POST | `/api/points/redeem` | 积分兑换 |
| GET | `/api/points/transactions` | 积分交易记录 |

### 联盟营销 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/affiliates` | 联盟商列表/创建 |
| GET | `/api/affiliates/[id]` | 联盟商详情 |
| GET/POST | `/api/affiliates/[id]/links` | 推广链接 |
| GET/POST | `/api/affiliates/[id]/commissions` | 佣金记录 |
| GET/POST | `/api/affiliates/[id]/payouts` | 提现记录 |
| GET | `/api/affiliates/link` | 通过推广码获取链接 |
| POST | `/api/affiliates/convert` | 转化追踪 |

### 套餐 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/bundles` | 套餐列表/创建 |
| GET | `/api/bundles/[id]` | 套餐详情 |
| GET/POST | `/api/bundles/[id]/items` | 套餐商品 |
| POST | `/api/bundles/[id]/validate` | 套餐验证 |

### 邮件序列 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/sequences` | 邮件序列列表/创建 |
| GET | `/api/sequences/[id]` | 序列详情 |
| POST | `/api/sequences/[id]/enroll` | 序列 enrollment |
| POST | `/api/sequences/trigger` | 触发序列 |

### 数据分析 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/analytics/overview` | 数据概览 |
| GET | `/api/analytics/sales` | 销售分析 |
| GET | `/api/analytics/products` | 商品分析 |
| GET | `/api/analytics/customers` | 客户分析 |
| GET | `/api/analytics/inventory` | 库存分析 |

### 后台管理 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/dashboard` | 仪表盘数据 |
| GET/POST | `/api/admin/orders` | 后台订单列表 |
| GET/POST | `/api/admin/roles` | 角色列表/创建 |
| GET/PUT/DELETE | `/api/admin/roles/[id]` | 角色操作 |
| GET/POST | `/api/admin/permissions` | 权限列表/创建 |
| GET/PUT/DELETE | `/api/admin/permissions/[id]` | 权限操作 |
| GET/POST | `/api/admin/users` | 用户列表/创建 |
| GET/PUT/DELETE | `/api/admin/users/[id]` | 用户操作 |
| GET/POST | `/api/admin/reviews` | 评论管理 |
| GET/POST | `/api/admin/profile` | 管理员资料 |

### 知识库 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/knowledge` | 知识库列表/创建 |
| GET/PUT/DELETE | `/api/knowledge/[id]` | 知识条目操作 |
| GET/POST | `/api/knowledge/categories` | 知识分类 |

### 客服 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/chat` | 客服消息 |
| POST | `/api/chat/feedback` | 聊天反馈 |

### 其他 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/currency/rates` | 实时汇率 |
| POST | `/api/stock-alert` | 库存预警 |
| POST | `/api/abandoned-cart` | 遗弃购物车记录 |
| GET/POST | `/api/import` | 商品导入 |
| GET | `/api/import/logs` | 导入日志 |

---

## 快速开始

### 环境要求

- Node.js 20.x+
- PostgreSQL 15+ (推荐 Neon Serverless PostgreSQL)
- npm / yarn / pnpm

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/Dante-Xr/solo-sales.git
cd solo-sales

# 安装依赖
npm install

# 配置环境变量
cp productions.env.example .env.local
# 编辑 .env.local 填入必要的环境变量

# 初始化数据库
npx prisma migrate deploy
npx prisma db seed

# 启动开发服务器
npm run dev
```

### 常用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (Turbopack) |
| `npm run build` | 构建生产版本 (含 Prisma Generate) |
| `npm start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint 检查 |
| `npm test` | 运行 Jest 测试 |
| `npm run test:watch` | 监听模式运行测试 |
| `npm run analyze` | 分析打包体积 |

### 构建生产版本

```bash
npm run build
npm start
```

---

## 部署

### Netlify 部署（推荐）

项目已配置 `netlify.toml`，支持一键部署到 Netlify。

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 部署到生产环境
npx netlify deploy --prod
```

### Vercel + Supabase 部署

详见 [DEPLOYMENT.md](DEPLOYMENT.md) 获取完整的 Vercel + Supabase 部署指南。

### 环境变量

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `DATABASE_URL` | ✅ | PostgreSQL 数据库连接字符串 |
| `BETTER_AUTH_URL` | ✅ | 生产环境 URL |
| `BETTER_AUTH_SECRET` | ✅ | Better Auth 加密密钥（`openssl rand -base64 32` 生成） |
| `UPSTASH_REDIS_REST_URL` | ✅ | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Upstash Redis REST Token |
| `STRIPE_SECRET_KEY` | ❌ | Stripe Secret Key |
| `STRIPE_PUBLIC_KEY` | ❌ | Stripe Publishable Key |
| `PAYPAL_CLIENT_ID` | ❌ | PayPal Client ID |
| `PAYPAL_CLIENT_SECRET` | ❌ | PayPal Client Secret |
| `SENTRY_DSN` | ❌ | Sentry DSN |

---

## 安全特性

| 特性 | 说明 |
|------|------|
| Better Auth | 数据库会话存储 + HMAC 签名 Cookie，支持即时撤销 |
| Rate Limiting | 基于 Redis 的分布式限流（注册 3次/5分钟、支付 10次/5分钟、搜索 30次/分钟） |
| 安全响应头 | CSP、HSTS、X-Frame-Options、X-Content-Type-Options |
| 环境变量验证 | Zod schema 验证所有环境变量 |
| API 参数验证 | Zod 验证所有 API 输入 |
| 密码加密 | bcryptjs 哈希存储 |
| RBAC | 完整的角色权限管理系统 |

---

## 默认账户

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 超级管理员 | admin@solosales.com | Admin@123456 |

> ⚠️ 生产环境部署后请立即修改默认密码。

---

## 许可证

MIT License - see LICENSE file for details.
