# SoloSales - 独立站电商系统

[![版本](https://img.shields.io/badge/version-0.4.0-blue.svg)](https://github.com/Dante-Xr/solo-sales)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2A52BE.svg)](https://prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

SoloSales 是一个现代化的独立站电商系统，支持前后台一体化的电商功能，包括商品展示、购物车、订单管理、支付集成，以及完整的后台管理系统。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 16.2.1 |
| 语言 | TypeScript | 5.x |
| 数据库 | PostgreSQL (Neon) | - |
| ORM | Prisma | 5.22.0 |
| 样式 | Tailwind CSS | 4.x |
| UI 组件 | shadcn/ui | 4.1.0 |
| 图表 | Recharts | 3.8.0 |
| 认证 | NextAuth.js | 4.24.13 |
| 表单验证 | Zod | 4.3.6 |
| 缓存 | Upstash Redis | 1.37.0 |

## 功能特性

### 前台商城
- 商品展示与搜索（支持 Enter 键触发搜索）
- 购物车管理（本地持久化）
- 用户认证（登录/注册）
- 订单管理
- 多语言支持（i18n）
- 主题切换（亮色/暗色）
- 支付集成（Stripe、PayPal）

### 后台管理系统
- **仪表盘**：销售数据可视化（图表统计）
- **商品管理**：商品增删改查、库存管理
- **订单管理**：订单列表、状态追踪
- **客户管理**：客户信息管理
- **RAG 知识库**：智能客服知识库管理
- **商品导入**：支持批发商 API 导入（如 1866 批发商）
- **权限管理**：基于 RBAC 的管理员系统

### 技术特性
- 性能优化（React.memo、动态加载、路由预取）
- 响应式设计（支持移动端）
- 缓存策略（Redis/Upstash）
- 限流保护（API 限流中间件）
- 数据库迁移支持

---

## 项目结构

```
solo_sales/
├── prisma/                          # 数据库模型与迁移
│   ├── schema.prisma               # Prisma 数据模型定义
│   └── seed-admin.ts               # 管理员数据初始化脚本
│
├── public/                          # 静态资源目录
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── src/
│   ├── app/                        # Next.js App Router 页面
│   │   ├── (shop)/                 # 商城前台页面（可选分组）
│   │   ├── admin/                  # 后台管理系统
│   │   │   ├── (auth)/            # 认证相关页面
│   │   │   │   ├── login/         # 管理员登录页
│   │   │   │   └── layout.tsx     # 认证布局
│   │   │   ├── chat/              # 客服聊天页面
│   │   │   ├── customers/         # 客户管理页面
│   │   │   ├── import/            # 商品导入页面
│   │   │   ├── knowledge/         # 知识库管理页面
│   │   │   ├── orders/            # 订单管理页面
│   │   │   ├── products/           # 商品管理页面
│   │   │   ├── roles/             # 角色管理页面
│   │   │   ├── settings/          # 系统设置页面
│   │   │   ├── users/             # 用户管理页面
│   │   │   ├── layout.tsx         # 后台布局
│   │   │   └── page.tsx           # 后台首页（仪表盘）
│   │   │
│   │   ├── api/                    # API 路由
│   │   │   ├── admin/             # 后台管理 API
│   │   │   │   ├── auth/          # 管理员认证
│   │   │   │   ├── orders/        # 订单管理
│   │   │   │   ├── permissions/  # 权限管理
│   │   │   │   ├── roles/        # 角色管理
│   │   │   │   └── users/        # 用户管理
│   │   │   ├── auth/              # 用户认证 API
│   │   │   │   ├── [...nextauth]/ # NextAuth 回调处理
│   │   │   │   └── register/     # 用户注册
│   │   │   ├── categories/        # 商品分类 API
│   │   │   ├── checkout/          # 支付 API
│   │   │   │   ├── paypal/       # PayPal 支付
│   │   │   │   └── stripe/       # Stripe 支付
│   │   │   ├── customers/         # 客户管理 API
│   │   │   ├── import/            # 商品导入 API
│   │   │   │   └── logs/         # 导入日志 API
│   │   │   ├── knowledge/         # 知识库 API
│   │   │   │   ├── [id]/         # 知识条目详情
│   │   │   │   └── categories/   # 知识分类
│   │   │   ├── orders/            # 订单 API
│   │   │   ├── products/          # 商品 API
│   │   │   │   ├── [id]/         # 商品详情
│   │   │   │   └── featured/     # 推荐商品
│   │   │   └── search/           # 搜索 API
│   │   │       └── trending/     # 热门搜索
│   │   │
│   │   ├── cart/                  # 购物车页面
│   │   ├── demo/                  # 演示页面
│   │   ├── orders/               # 订单页面
│   │   │   ├── [id]/             # 订单详情
│   │   │   └── page.tsx          # 订单列表
│   │   ├── product/              # 商品详情页
│   │   │   └── [id]/
│   │   ├── profile/              # 用户资料页
│   │   ├── search/              # 搜索结果页
│   │   │
│   │   ├── globals.css          # 全局样式
│   │   ├── layout.tsx           # 根布局
│   │   └── page.tsx             # 首页
│   │
│   ├── components/               # React 组件
│   │   ├── admin/               # 后台管理组件
│   │   │   ├── app-sidebar.tsx  # 侧边栏
│   │   │   └── SalesChart.tsx   # 销售图表
│   │   │
│   │   ├── auth/                # 认证组件
│   │   │   ├── AuthModal.tsx    # 认证弹窗
│   │   │   ├── GuestCheckoutForm.tsx  # 访客结账
│   │   │   ├── LoginForm.tsx    # 登录表单
│   │   │   └── RegisterForm.tsx # 注册表单
│   │   │
│   │   ├── checkout/            # 结账组件
│   │   │   ├── CheckoutModal.tsx        # 结账弹窗
│   │   │   └── EnhancedCheckoutModal.tsx # 增强版结账
│   │   │
│   │   ├── logistics/           # 物流组件
│   │   │   └── LogisticsCard.tsx # 物流信息卡片
│   │   │
│   │   ├── order/               # 订单组件
│   │   │   └── TrackingTimeline.tsx # 追踪时间线
│   │   │
│   │   ├── providers/           # Context 提供者
│   │   │   ├── AuthProvider.tsx # 认证上下文
│   │   │   └── ThemeProvider.tsx # 主题上下文
│   │   │
│   │   ├── storefront/          # 商城前台组件
│   │   │   ├── HomeCarousel.tsx  # 首页轮播
│   │   │   ├── SearchBar.tsx     # 搜索栏
│   │   │   ├── SearchBox.tsx     # 搜索框（Enter 触发）
│   │   │   ├── ShareMenu.tsx     # 分享菜单
│   │   │   ├── UserMenu.tsx      # 用户菜单
│   │   │   └── WelcomeModal.tsx  # 欢迎弹窗
│   │   │
│   │   └── ui/                  # 基础 UI 组件（shadcn/ui）
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       └── tooltip.tsx
│   │
│   ├── context/                 # React Context
│   │   ├── CartContext.tsx       # 购物车上下文
│   │   ├── LanguageContext.tsx   # 多语言上下文
│   │   └── WishlistContext.tsx   # 愿望清单上下文
│   │
│   ├── hooks/                   # 自定义 Hooks
│   │   └── use-mobile.ts        # 移动端检测
│   │
│   ├── i18n/                    # 国际化
│   │   └── translations.ts      # 翻译文本
│   │
│   ├── lib/                     # 工具库
│   │   ├── cache.ts             # 缓存工具
│   │   ├── env-validator.ts     # 环境变量验证
│   │   ├── prisma.ts           # Prisma 客户端
│   │   ├── redis.ts            # Redis 客户端
│   │   ├── utils.ts            # 通用工具函数
│   │   ├── validators.ts       # Zod 验证器
│   │   │
│   │   └── wholesalers/        # 批发商 API 客户端
│   │       ├── client.ts       # 基础客户端类
│   │       ├── logger.ts       # 日志工具
│   │       ├── types.ts        # 通用类型
│   │       └── 1866/           # 1866 批发商实现
│   │           ├── client.ts   # API 客户端
│   │           ├── mapper.ts   # 数据映射
│   │           └── types.ts    # 类型定义
│   │
│   └── middleware/              # Next.js 中间件
│       └── rate-limit.ts       # API 限流
│
├── .trae/                       # AI 代理相关文档
│   ├── documents/               # 需求与计划文档
│   ├── plans/                  # 优化计划
│   └── specs/                  # 详细规格说明
│
├── netlify.toml                 # Netlify 部署配置
├── next.config.ts              # Next.js 配置
├── package.json                # 项目依赖
├── tsconfig.json               # TypeScript 配置
├── tailwind.config.ts          # Tailwind CSS 配置
├── postcss.config.mjs          # PostCSS 配置
└── components.json             # shadcn/ui 组件配置
```

---

## 数据库模型

SoloSales 使用 Prisma ORM，数据模型设计如下：

### 核心业务模型

| 模型 | 说明 |
|------|------|
| `User` | 用户模型（普通用户/管理员） |
| `Category` | 商品分类 |
| `Product` | 商品（含 SKU 支持批发导入） |
| `Order` | 订单 |
| `OrderItem` | 订单明细 |
| `Payment` | 支付记录 |

### 扩展模块

| 模型 | 说明 |
|------|------|
| `KnowledgeCategory` | 知识库分类（支持多级） |
| `KnowledgeBase` | 知识库条目 |
| `KnowledgeHistory` | 知识库版本历史 |
| `ImportLog` | 批发商品导入日志 |
| `Message` | 客服消息 |

### 权限管理模型

| 模型 | 说明 |
|------|------|
| `Permission` | 权限定义（页面/操作） |
| `Role` | 角色（关联权限集合） |
| `AdminUser` | 管理员用户 |

---

## API 概览

### 认证 API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| ANY | `/api/auth/[...nextauth]` | NextAuth 认证回调 |
| POST | `/api/admin/auth` | 管理员登录 |

### 商城 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/products` | 商品列表/创建 |
| GET | `/api/products/[id]` | 商品详情 |
| GET | `/api/products/featured` | 推荐商品 |
| GET/POST | `/api/categories` | 分类列表/创建 |
| GET/POST | `/api/orders` | 订单列表/创建 |
| GET | `/api/search/trending` | 热门搜索 |
| POST | `/api/checkout/stripe` | Stripe 支付 |
| POST | `/api/checkout/paypal` | PayPal 支付 |

### 后台管理 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/admin/users` | 用户列表/创建 |
| GET/PUT/DELETE | `/api/admin/users/[id]` | 用户操作 |
| GET/POST | `/api/admin/roles` | 角色列表/创建 |
| GET/PUT/DELETE | `/api/admin/roles/[id]` | 角色操作 |
| GET/POST | `/api/admin/permissions` | 权限列表/创建 |
| GET/PUT/DELETE | `/api/admin/permissions/[id]` | 权限操作 |
| GET | `/api/admin/orders` | 后台订单列表 |

### 知识库 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/knowledge` | 知识列表/创建 |
| GET/PUT/DELETE | `/api/knowledge/[id]` | 知识条目操作 |
| GET/POST | `/api/knowledge/categories` | 知识分类 |

### 导入 API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/import` | 触发商品导入 |
| GET | `/api/import/logs` | 导入日志 |

---

## 环境变量

### 必需变量

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### 可选变量

```env
# Stripe
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx

# PayPal
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx

# Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# 批发商 API
WHOLESALER_1866_API_KEY=xxx
WHOLESALER_1866_API_URL=https://api.1866.com/v1
```

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp productions.env.example .env.local
# 编辑 .env.local 填入实际值
```

### 3. 初始化数据库

```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 初始化管理员数据
npx ts-node prisma/seed-admin.ts
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 后台管理系统

访问 http://localhost:3000/admin

默认管理员账号：
- 邮箱：`admin@solosales.com`
- 密码：`Admin@123456`

---

## 部署

### Netlify 部署

项目已配置 `netlify.toml`，支持一键部署：

1. 将代码推送到 GitHub
2. 在 Netlify 中导入项目
3. 配置环境变量
4. 部署完成

### Vercel 部署

```bash
npm run build
vercel deploy
```

---

## 性能优化 (v0.2.1)

- React.memo 组件优化
- 动态导入（WelcomeModal）
- 轮播图定时器优化
- 路由预取
- Bundle 分析支持

---

## 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 0.4.0 | 2026-03-24 | 数据库迁移至 Neon，GitHub 仓库配置 |
| 0.3.3 | 2026-03-23 | 后台管理系统性能优化与移动端适配 |
| 0.3.2 | 2026-03-22 | RAG 知识库、批发商 API 集成 |
| 0.3.1 | 2026-03-21 | 后台管理系统完善 |
| 0.3.0 | 2026-03-20 | 后台管理系统开发 |
| 0.2.1 | 2026-03-19 | 性能优化 |
| 0.2.0 | 2026-03-18 | 电商核心功能 |
| 0.1.0 | 2026-03-17 | 项目初始化 |

---

## 开发指南

### 添加新组件

项目使用 shadcn/ui 组件库：

```bash
npx shadcn@latest add button
```

### 添加新 API

在 `src/app/api/` 下创建对应的路由文件：

```typescript
// src/app/api/example/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hello' })
}
```

### 添加新数据模型

1. 编辑 `prisma/schema.prisma`
2. 运行 `npx prisma generate`
3. 运行 `npx prisma migrate dev`

---

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 项目地址

- GitHub: https://github.com/Dante-Xr/solo-sales
- 演示地址: https://solo-shop-xxx.netlify.app
