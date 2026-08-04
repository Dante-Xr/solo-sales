# SoloSales 部署指南 / Deployment Guide

本文档说明如何将 SoloSales 独立站部署到互联网。
This document describes how to deploy SoloSales independent website to the internet.

---

## 快速开始 / Quick Start

### 方案一：Vercel + Neon（当前部署）/ Option 1: Vercel + Neon (Current Deployment)

#### 1. 注册必要服务 / Register Required Services

- [Vercel](https://vercel.com) - Next.js 部署平台 / Next.js deployment platform
- [Neon](https://neon.tech) - Serverless PostgreSQL 数据库 / Serverless PostgreSQL database

#### 2. 创建 Neon 数据库 / Create Neon Database

1. 登录 Neon，创建新项目 / Log in to Neon, create a new project
2. 等待数据库创建完成（约2分钟）/ Wait for database creation (~2 minutes)
3. 在 Dashboard > Connection Details 中获取 `DATABASE_URL`
4. 格式 / Format: use the connection string copied from Neon; do not commit the value.

#### 3. 配置环境变量 / Configure Environment Variables

在 Vercel 项目 Settings > Environment Variables 中添加以下环境变量：
Add the following environment variables in Vercel project Settings > Environment Variables:

| 变量名 / Variable | 说明 / Description | 示例值 / Example |
|-------------------|---------------------|------------------|
| `DATABASE_URL` | Neon PostgreSQL 连接字符串 / Neon PostgreSQL connection string | `postgresql://...` |
| `BETTER_AUTH_URL` | 生产环境 URL / Production environment URL | `https://solo-sales.vercel.app` |
| `BETTER_AUTH_SECRET` | Better Auth 加密密钥 / Better Auth encryption secret | `openssl rand -base64 32` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL / Upstash Redis REST URL | `https://...upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token / Upstash Redis REST Token | `<set-in-deployment-secret-manager>` |
| `SMTP_HOST` / `SMTP_PORT` | 认证邮件 SMTP 主机与端口（仅 465 / 587） | `smtp.example.com` / `465` |
| `SMTP_USER` / `SMTP_PASS` | SMTP 登录名与授权密码 | `<set-in-deployment-secret-manager>` |
| `SMTP_FROM` | 可选发件人；未设置时使用 `SMTP_USER` | `noreply@example.com` |
| `AUTH_RECOVERY_HMAC_SECRET` | 恢复审计、OTP 与指纹 HMAC 密钥 | `<set-in-deployment-secret-manager>` |
| `AUTH_RECOVERY_ENCRYPTION_KEY_ID` | 当前认证邮件队列密钥 ID | `2026-07` |
| `AUTH_RECOVERY_ENCRYPTION_KEY` | 恰好 32 UTF-8 字节的队列加密密钥 | `<set-in-deployment-secret-manager>` |
| `AUTH_RECOVERY_ENCRYPTION_OLD_KEYS` | 可选旧 key ID 到密钥 JSON 映射，用于轮换期间消费旧任务 | `<set-in-deployment-secret-manager>` |
| `AUTH_EMAIL_WORKER_TOKEN` | 外部定时器和应急 worker HTTP 入口 bearer token | `<set-in-deployment-secret-manager>` |
| `STRIPE_SECRET_KEY` | Stripe 私钥 / Stripe secret key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 签名密钥 / Stripe webhook signing secret | `whsec_...` |

#### 4. 部署到 Vercel / Deploy to Vercel

1. 将代码推送到 GitHub 仓库 / Push code to GitHub repository
2. 在 Vercel 中导入项目 / Import project in Vercel
3. 选择 GitHub 仓库 / Select GitHub repository
4. 使用 Next.js 默认构建配置 / Use the default Next.js build configuration
   - 构建命令 / Build command: `npm run build`
   - Framework Preset: `Next.js`
5. 配置环境变量 / Configure environment variables
6. 点击 Deploy / Click Deploy
7. 访问 `https://solo-sales.vercel.app/zh` 验证生产站点。

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
BETTER_AUTH_URL="https://solo-sales.vercel.app"
BETTER_AUTH_SECRET="<generated-random-secret>"

# Redis 限速和后台能力 / Redis for rate limiting and background capabilities
UPSTASH_REDIS_REST_URL="<set-in-deployment-secret-manager>"
UPSTASH_REDIS_REST_TOKEN="<set-in-deployment-secret-manager>"

# 认证邮件恢复（所有值在 Vercel Environment Variables 配置）
SMTP_HOST="smtp.example.com"
SMTP_PORT="465"
SMTP_USER="<set-in-deployment-secret-manager>"
SMTP_PASS="<set-in-deployment-secret-manager>"
SMTP_FROM="noreply@example.com"
AUTH_RECOVERY_HMAC_SECRET="<set-in-deployment-secret-manager>"
AUTH_RECOVERY_ENCRYPTION_KEY_ID="2026-07"
AUTH_RECOVERY_ENCRYPTION_KEY="<exactly-32-UTF-8-byte-key>"
AUTH_RECOVERY_ENCRYPTION_OLD_KEYS="<optional-json-keyring>"
AUTH_EMAIL_WORKER_TOKEN="<set-in-deployment-secret-manager>"
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
- `/api/health` - 数据库、Redis 与认证邮件 worker 健康状态

认证邮件验收：使用拥有 `worker.manage` 的管理员在“系统设置 > 任务调度”启用 worker。Vercel 不会自动执行仓库中的 Netlify Scheduled Function；如需自动发送认证邮件，必须配置外部定时器每分钟向 `https://solo-sales.vercel.app/api/internal/auth-email-jobs/scheduled` 发起 `POST`，并携带 `Authorization: Bearer <AUTH_EMAIL_WORKER_TOKEN>`。原 `POST /api/internal/auth-email-jobs` 仅用于人工应急调用。启用预检必须通过，随后执行真实 OTP 重置并确认运行历史、死信和 `/api/health` 状态。

---

## 常见问题 / FAQ

### Q: 部署后数据库连接失败？/ Database connection fails after deployment?

A: 检查 `DATABASE_URL` 是否正确，确保包含 `?sslmode=require` / Check if `DATABASE_URL` is correct and includes `?sslmode=require`

### Q: BETTER_AUTH_URL 应该填什么？/ What should I fill in for BETTER_AUTH_URL?

A: 填入 Vercel 生产域名：`https://solo-sales.vercel.app`

### Q: 如何更新生产环境代码？/ How to update production code?

A: 只需将代码推送到 GitHub，Vercel 会自动重新部署 / Simply push code to GitHub, Vercel will automatically redeploy

### Q: 如何配置自定义域名？/ How to configure custom domain?

A: 在 Vercel Project Settings > Domains 中添加自定义域名，并配置 DNS 记录 / Add a custom domain in Vercel Project Settings > Domains and configure DNS records

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
