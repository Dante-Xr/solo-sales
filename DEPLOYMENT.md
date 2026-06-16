# SoloSales 部署指南 / Deployment Guide

本文档说明如何将 SoloSales 独立站部署到互联网。
This document describes how to deploy SoloSales independent website to the internet.

---

## 快速开始 / Quick Start

### 方案一：Netlify + Neon（推荐）/ Option 1: Netlify + Neon (Recommended)

#### 1. 注册必要服务 / Register Required Services

- [Netlify](https://netlify.com) - 静态网站和 Next.js 部署平台 / Static site and Next.js deployment platform
- [Neon](https://neon.tech) - Serverless PostgreSQL 数据库 / Serverless PostgreSQL database

#### 2. 创建 Neon 数据库 / Create Neon Database

1. 登录 Neon，创建新项目 / Log in to Neon, create a new project
2. 等待数据库创建完成（约2分钟）/ Wait for database creation (~2 minutes)
3. 在 Dashboard > Connection Details 中获取 `DATABASE_URL`
4. 格式 / Format: use the connection string copied from Neon; do not commit the value.

#### 3. 配置环境变量 / Configure Environment Variables

在 Netlify 项目设置中添加以下环境变量：
Add the following environment variables in Netlify project settings:

| 变量名 / Variable | 说明 / Description | 示例值 / Example |
|-------------------|---------------------|------------------|
| `DATABASE_URL` | Neon PostgreSQL 连接字符串 / Neon PostgreSQL connection string | `postgresql://...` |
| `BETTER_AUTH_URL` | 生产环境 URL / Production environment URL | `https://your-site.netlify.app` |
| `BETTER_AUTH_SECRET` | Better Auth 加密密钥 / Better Auth encryption secret | `openssl rand -base64 32` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL / Upstash Redis REST URL | `https://...upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token / Upstash Redis REST Token | `<set-in-deployment-secret-manager>` |
| `STRIPE_SECRET_KEY` | Stripe 私钥 / Stripe secret key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 签名密钥 / Stripe webhook signing secret | `whsec_...` |

#### 4. 部署到 Netlify / Deploy to Netlify

1. 将代码推送到 GitHub 仓库 / Push code to GitHub repository
2. 在 Netlify 中导入项目 / Import project in Netlify
3. 选择 GitHub 仓库 / Select GitHub repository
4. 配置构建命令和发布目录 / Configure build command and publish directory
   - 构建命令 / Build command: `npm run build`
   - 发布目录 / Publish directory: `.next`
5. 配置环境变量 / Configure environment variables
6. 点击 Deploy / Click Deploy

#### 5. 运行数据库迁移 / Run Database Migration

部署完成后，运行以下命令进行数据库迁移：
After deployment, run the following command for database migration:

```bash
npx prisma migrate deploy
```

或者在 Neon SQL Editor 中手动执行迁移 SQL。
Or manually execute migration SQL in Neon SQL Editor.

---

### 方案二：Railway（一体化部署）/ Option 2: Railway (All-in-One Deployment)

1. 注册 [Railway](https://railway.app)
2. 创建 PostgreSQL 插件 / Create PostgreSQL plugin
3. 部署 Next.js 应用 / Deploy Next.js application
4. 配置环境变量 / Configure environment variables

---

## 环境变量说明 / Environment Variables

### 必须配置 / Required Configuration

```env
# 数据库连接 / Database connection
DATABASE_URL="<set-in-deployment-secret-manager>"

# Better Auth 配置 / Better Auth configuration
BETTER_AUTH_URL="https://your-domain.netlify.app"
BETTER_AUTH_SECRET="<generated-random-secret>"

# Redis 限速和后台能力 / Redis for rate limiting and background capabilities
UPSTASH_REDIS_REST_URL="<set-in-deployment-secret-manager>"
UPSTASH_REDIS_REST_TOKEN="<set-in-deployment-secret-manager>"
```

### 支付配置 / Payment Configuration

```env
# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## 生成 BETTER_AUTH_SECRET / Generate BETTER_AUTH_SECRET

在终端中运行 / Run in terminal:

```bash
openssl rand -base64 32
```

---

## 数据库设置 / Database Setup

### Neon SQL Editor

如果自动迁移失败，可以手动在 Neon SQL Editor 中执行 / If automatic migration fails, manually execute in Neon SQL Editor:

1. 创建扩展（如果需要）/ Create extensions (if needed):
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

2. 创建表结构（参考 `prisma/schema.prisma`）/ Create table structure (reference `prisma/schema.prisma`)

---

## 验证部署 / Verify Deployment

部署完成后，访问以下页面验证 / After deployment, verify by visiting:

- `/` - 首页 / Homepage
- `/demo` - 演示页面（无需登录）/ Demo page (no login required)
- `/cart` - 购物车页面 / Shopping cart page

---

## 常见问题 / FAQ

### Q: 部署后数据库连接失败？/ Database connection fails after deployment?

A: 检查 `DATABASE_URL` 是否正确，确保包含 `?sslmode=require` / Check if `DATABASE_URL` is correct and includes `?sslmode=require`

### Q: BETTER_AUTH_URL 应该填什么？/ What should I fill in for BETTER_AUTH_URL?

A: 填入 Netlify 分配给你的域名，例如 / Fill in the domain assigned by Netlify, e.g., `https://solo-sales-xxx.netlify.app`

### Q: 如何更新生产环境代码？/ How to update production code?

A: 只需将代码推送到 GitHub，Netlify 会自动重新部署 / Simply push code to GitHub, Netlify will automatically redeploy

### Q: 如何配置自定义域名？/ How to configure custom domain?

A: 在 Netlify Domain Settings 中添加自定义域名，并配置 DNS 记录 / Add custom domain in Netlify Domain Settings and configure DNS records

---

## 技术栈 / Tech Stack

- **框架 / Framework**: Next.js 16 with Turbopack
- **数据库 / Database**: PostgreSQL + Prisma 5
- **认证 / Authentication**: Better Auth
- **管理后台 / Admin Panel**: Refine Framework
- **数据可视化 / Data Visualization**: Tremor Charts
- **国际化 / Internationalization**: next-intl
- **状态管理 / State Management**: Zustand
- **数据获取 / Data Fetching**: TanStack Query
- **样式 / Styling**: Tailwind CSS + shadcn/ui
- **支付 / Payments**: Stripe
- **主题 / Theme**: next-themes (深色/浅色模式 / Dark/Light mode)
