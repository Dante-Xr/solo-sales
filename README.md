# SoloSales - 独立站电商系统

[![版本](https://img.shields.io/badge/version-1.4.0-blue.svg)](https://github.com/Dante-Xr/solo-sales)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2A52BE.svg)](https://prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

SoloSales 是一个现代化的独立站电商系统，基于 Next.js 16 App Router 构建，支持前后台一体化。涵盖商品展示、购物车、订单管理、支付集成、智能客服（RAG）、联盟营销、积分系统，以及完整的 RBAC 后台管理系统。v1.4 引入 `src/server` 模块化单体架构，将业务逻辑收敛到 service/repository/contracts 分层。

---

## 技术栈

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 前端框架 | Next.js (App Router + Turbopack) | 16.2.4 | 全栈 React 框架 |
| UI 框架 | React | 19.2.4 | |
| 语言 | TypeScript | 5.x | |
| 数据库 | PostgreSQL (Neon) | - | Serverless PostgreSQL |
| ORM | Prisma | 5.22.0 | 含 `@prisma/adapter-pg` |
| 缓存 | Upstash Redis | 1.37.0 | 分布式缓存 + 限流 |
| 认证 | Better Auth | 1.6.2 | 支持 admin 插件 |
| 样式 | Tailwind CSS | 4.x | |
| UI 组件 | shadcn/ui | 4.1.0 | |
| 基础组件 | @base-ui/react | 1.3.0 | |
| 图表 | Recharts | 3.8.0 | |
| 数据面板 | @tremor/react | 4.0.0-beta | |
| 图标 | Lucide React | 0.577.0 | |
| 动画 | Tw Animate CSS | 1.4.0 | |
| 轮播 | Embla Carousel | 8.6.0 | |
| 客户端状态 | Zustand | 5.0.12 | 购物车、愿望清单、视口模式 |
| 服务端状态 | TanStack React Query | 5.95.2 | 数据请求与缓存 |
| 后台框架 | Refine | 5.0.12 | 管理后台 CRUD 框架 |
| 国际化 | next-intl | 4.9.1 | 中英文切换 |
| 表单验证 | Zod | 4.3.6 | |
| 支付 | Stripe / PayPal | 20.4.1 / 1.8.1 | |
| 错误监控 | Sentry | 10.46.0 | |
| 日期处理 | date-fns | 4.1.0 | |
| 测试 | Jest | 30.3.0 | |
| E2E 测试 | Playwright | 1.59.1 | |

---

## 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                    │
├──────────────┬──────────────────────┬───────────────────┤
│  前台页面     │    API Routes        │   后台页面         │
│  [locale]/*  │    /api/*            │   admin/*         │
├──────────────┼──────────────────────┼───────────────────┤
│  Storefront  │    src/server        │   Refine + Tremor │
│  Components  │  ┌───────────────┐   │   Components      │
│              │  │  Services     │   │                   │
│              │  │  Repositories │   │                   │
│              │  │  Contracts    │   │                   │
│              │  └───────────────┘   │                   │
├──────────────┴──────────────────────┴───────────────────┤
│              Prisma ORM + Neon PostgreSQL                │
│              Upstash Redis (缓存/限流)                    │
└─────────────────────────────────────────────────────────┘
```

### 服务端分层架构 (v1.4+)

v1.4 引入 `src/server` 模块化单体架构，将业务逻辑从 API Route 中剥离到独立的服务层：

```
src/server/
├── contracts/          # 统一 API 响应契约与错误模型
│   ├── api.ts          # successResponse / handleApiError
│   └── errors.ts       # ErrorCodes / AppError / StatusCodeMap
├── services/           # 业务服务层
│   ├── order-service.ts
│   ├── payment-service.ts
│   ├── product-service.ts
│   ├── promotion-service.ts
│   ├── inventory-service.ts
│   └── admin-service.ts
├── repositories/       # 数据访问层 (Prisma 封装)
│   ├── order-repository.ts
│   ├── product-repository.ts
│   ├── promotion-repository.ts
│   ├── inventory-repository.ts
│   └── admin-repository.ts
├── auth/               # 服务端鉴权
│   └── session.ts
├── payments/           # 支付 SDK 封装
│   └── stripe.ts
└── __mocks__/          # 测试 Mock
    └── server-only.ts
```

**统一 API 响应格式：**

```typescript
// 成功响应
{ success: true, data: T, meta?: Record<string, unknown> }

// 错误响应
{ success: false, error: { code: string, message: string, details?: unknown } }
```

所有服务端模块引入 `server-only`，确保不被 Client Component 误导入。

---

## 功能模块

### 前台商城

| 模块 | 功能描述 |
|------|----------|
| **商品展示** | 商品列表、详情页、品牌展示，支持分类筛选和搜索 |
| **购物车** | Zustand 持久化购物车，支持增减数量、删除、折扣码、Upsell 推荐 |
| **用户认证** | Better Auth 邮箱注册登录、访客结账、管理员插件 |
| **订单管理** | 订单创建、支付、状态追踪、物流信息展示 |
| **多语言** | next-intl 国际化支持（中英文切换，默认中文） |
| **主题切换** | 亮色/暗色主题切换 (next-themes) |
| **PWA 支持** | 渐进式应用支持 |
| **多币种** | 实时汇率转换 (CurrencyService) |
| **底部导航** | 移动端固定底部 Tab 导航栏（首页/搜索/购物车/我的） |
| **Hero Banner** | 首页轮播展示、分类快捷入口 |
| **统一布局** | StorefrontPageLayout 提供一致的页面布局体验 |
| **视口切换** | PC 端手机模式切换，强制控制布局不受窗口大小影响 |

### 支付集成

| 支付方式 | 状态 | 说明 |
|----------|------|------|
| Stripe | ✅ | 信用卡/借记卡支付，webhook 签名校验 + 幂等保护 |
| PayPal | ✅ | PayPal 账户支付 |
| 折扣码 | ✅ | Stripe Coupon 折扣系统 |

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
| **商品管理** | Refine CRUD、库存管理、图片管理、商品变体管理 |
| **订单管理** | 订单列表、状态管理、订单详情 |
| **客户管理** | 客户信息、订单历史、积分查看 |
| **权限管理** | RBAC 权限系统 - 角色、权限、用户管理 |
| **知识库管理** | RAG 知识库内容的增删改查 |
| **商品导入** | 批发商 API 导入（支持 1866 批发商） |
| **客服聊天** | 管理员客服会话界面 |
| **系统设置** | 系统配置管理 |

#### 高级管理组件

| 模块 | 功能描述 |
|------|----------|
| **VariantManager** | 商品变体管理 - 属性组配置、变体组合生成（笛卡尔积）、批量编辑 |
| **InventoryAlert** | 智能库存预警 - 四级预警、可售天数预测、建议补货计算 |
| **AuditLog** | 操作日志 - 多维度筛选、修改前后对比、分页导航 |
| **DataExporter** | 数据导出 - CSV/JSON/Excel/PDF 多格式支持 |
| **BatchActionBar** | 批量操作栏 - 批量上下架、批量删除、批量折扣 |
| **KpiCard** | KPI 卡片 - 关键指标展示 |

### 设计系统

| 类别 | 描述 |
|------|------|
| **品牌色彩** | CSS 变量 `--brand`, `--price`, `--success`, `--warning`, `--info` (oklch 色彩系统) |
| **响应式网格** | 商品网格：移动端 2 列、平板 3 列、PC 4 列、大屏 5 列 |
| **触控优化** | 移动端最小 44x44px 触控区域 |
| **统一布局** | StorefrontPageLayout 组件提供一致的页面结构 |
| **系统字体** | 移除 Google Fonts 网络依赖，使用系统字体变量 |

---

## 项目结构

```
solo_sales/
├── prisma/
│   ├── schema.prisma              # Prisma 数据模型定义
│   ├── seed-admin.ts              # 管理员数据初始化脚本
│   ├── seed-products.ts           # 商品数据初始化脚本
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
│   │   │   │   ├── chat/          # 客服聊天
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
│   │   │   ├── about/             # 关于页面
│   │   │   ├── cart/              # 购物车页面
│   │   │   ├── contact/           # 联系页面
│   │   │   ├── demo/              # 演示页面
│   │   │   ├── faq/               # FAQ 页面
│   │   │   ├── orders/            # 订单页面
│   │   │   ├── privacy/           # 隐私政策
│   │   │   ├── product/[id]/      # 商品详情页
│   │   │   ├── products/          # 商品列表页
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
│   │   │   ├── csrf-token/        # CSRF Token
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
│   ├── server/                    # 服务端业务层 (v1.4+)
│   │   ├── contracts/             # API 响应契约与错误模型
│   │   ├── services/              # 业务服务 (6 个领域服务)
│   │   ├── repositories/          # 数据访问层 (5 个仓储)
│   │   ├── auth/                  # 服务端鉴权
│   │   ├── payments/              # 支付 SDK 封装
│   │   └── __mocks__/             # 测试 Mock
│   │
│   ├── components/
│   │   ├── admin/                 # 后台管理组件
│   │   │   ├── advanced/          # 高级组件 (VariantManager, InventoryAlert, AuditLog)
│   │   │   ├── charts/            # 图表组件 (11 个图表组件)
│   │   │   ├── layout/            # 布局组件 (Breadcrumb, PageTabs, GlobalSearch)
│   │   │   ├── products/          # 商品管理 (BatchDiscountModal, QuickEditCell, StockAdjuster)
│   │   │   └── table/             # 表格组件 (ColumnCustomizer, TableSorter, DataExporter)
│   │   ├── analytics/             # 数据分析组件
│   │   ├── auth/                  # 认证组件
│   │   ├── chatbot/               # 智能客服组件
│   │   ├── checkout/              # 结账组件 (EnhancedCheckoutModal, CouponInput, Upsell)
│   │   ├── cookie/                # Cookie 同意组件
│   │   ├── currency/              # 货币选择组件
│   │   ├── error/                 # 错误边界
│   │   ├── logistics/             # 物流组件
│   │   ├── order/                 # 订单组件
│   │   ├── points/                # 积分组件
│   │   ├── product/               # 商品展示组件 (16 个组件)
│   │   ├── providers/             # Context 提供者 (Auth, Query, Theme)
│   │   ├── seo/                   # SEO 组件
│   │   ├── storefront/            # 商城前台组件 (24 个组件)
│   │   └── ui/                    # 基础 UI 组件 (shadcn/ui, 25 个组件)
│   │
│   ├── hooks/                     # 自定义 Hooks (8 个)
│   ├── i18n/                      # 国际化配置与翻译文件
│   ├── lib/                       # 工具库与服务
│   │   ├── affiliate/             # 联盟营销服务
│   │   ├── analytics/             # 数据分析服务
│   │   ├── bundle/                # 套餐服务
│   │   ├── currency/              # 货币服务
│   │   ├── marketing/             # 营销引擎
│   │   ├── rag/                   # RAG 知识库
│   │   ├── services/              # 业务服务 (AbandonedCart, Email, StockAlert)
│   │   ├── wholesalers/           # 批发商客户端 (1866)
│   │   ├── api-client.ts          # API 客户端 (自动解包标准响应)
│   │   ├── refine-data-provider.ts # Refine 数据适配
│   │   ├── refine-auth-provider.ts # Refine 认证适配
│   │   └── ...                    # 其他工具
│   ├── stores/                    # Zustand 状态管理 (3 个 Store)
│   └── middleware/                # API 限流中间件
│
├── netlify.toml                   # Netlify 部署配置
├── next.config.ts                 # Next.js 配置
├── jest.config.ts                 # Jest 测试配置
├── eslint.config.mjs              # ESLint 配置
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
| `Affiliate` / `AffiliateLink` / `AffiliateCommission` / `AffiliatePayout` | 联盟营销 |
| `Coupon` / `CouponUsage` | 折扣码 |
| `Bundle` / `BundleItem` | 套餐 |
| `Review` / `ReviewReply` | 商品评论 |
| `CurrencyRate` | 货币汇率缓存 |
| `AbandonedCart` | 遗弃购物车 |
| `EmailSequence` / `EmailSequenceEnrollment` | 邮件序列 |

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
| GET | `/api/csrf-token` | CSRF Token |
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
| `STRIPE_WEBHOOK_SECRET` | ❌ | Stripe Webhook 签名密钥 |
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
| 订单金额信任边界 | 服务端按数据库价格重新计算，不信任客户端传入金额 |
| Stripe Webhook 幂等 | 签名校验 + 重复事件幂等保护 |
| server-only 约束 | 服务端模块不可被 Client Component 导入 |

---

## 测试

| 测试类型 | 框架 | 覆盖范围 |
|----------|------|----------|
| 单元测试 | Jest | 服务层、客户端工具、页面组件 |
| E2E 测试 | Playwright | 浏览器端到端测试 |

### 服务层测试 (33 suites / 145 tests)

| 测试文件 | 覆盖内容 |
|----------|----------|
| `order-service.test.ts` | 订单金额信任边界、库存不足、事务扣库存 |
| `payment-service.test.ts` | Stripe checkout、webhook、幂等保护 |
| `product-service.test.ts` | 商品查询、SKU 冲突、分类保护、断连重试 |
| `promotion-service.test.ts` | 优惠券封顶、使用次数限制、积分余额 |
| `inventory-service.test.ts` | 导入进度、失败统计、库存预警 |
| `admin-service.test.ts` | 管理员唯一性、角色保护、权限分页 |
| `api-client.test.ts` | 标准响应解包与错误处理 |
| `refine-data-provider.test.ts` | 列表解包、旧数组兼容、结构化错误 |

---

## 默认账户

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 超级管理员 | admin@solosales.com | Admin@123456 |

> ⚠️ 生产环境部署后请立即修改默认密码。

---

## 许可证

MIT License - see LICENSE file for details.
