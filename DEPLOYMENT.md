# SoloSales 部署指南

本文档说明如何将 SoloSales 独立站部署到互联网。

## 快速开始

### 方案一：Vercel + Supabase（推荐）

#### 1. 注册必要服务

- [Vercel](https://vercel.com) - Next.js 部署平台
- [Supabase](https://supabase.com) - PostgreSQL 数据库

#### 2. 创建 Supabase 数据库

1. 登录 Supabase，创建新项目
2. 等待数据库创建完成（约2分钟）
3. 在 Settings > Connection String 中获取 `DATABASE_URL`
4. 格式：`postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require`

#### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DATABASE_URL` | Supabase PostgreSQL 连接字符串 | `postgresql://...` |
| `NEXTAUTH_URL` | 生产环境 URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | JWT 加密密钥 | `openssl rand -base64 32` 生成 |
| `STRIPE_PUBLIC_KEY` | Stripe 公钥（可选） | `pk_test_xxx` |
| `STRIPE_SECRET_KEY` | Stripe 私钥（可选） | `sk_test_xxx` |
| `PAYPAL_CLIENT_ID` | PayPal 客户端 ID（可选） | `xxx` |
| `PAYPAL_CLIENT_SECRET` | PayPal 客户端密钥（可选） | `xxx` |

#### 4. 部署到 Vercel

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 中 Import 项目
3. 选择 GitHub 仓库
4. 配置环境变量
5. 点击 Deploy

#### 5. 运行数据库迁移

部署完成后，在 Vercel 项目中使用以下命令运行迁移：

```bash
npx prisma migrate deploy
```

或者在 Supabase SQL Editor 中手动执行迁移 SQL。

---

### 方案二：Railway（一体化部署）

1. 注册 [Railway](https://railway.app)
2. 创建 PostgreSQL 插件
3. 部署 Next.js 应用
4. 配置环境变量

---

## 环境变量说明

### 必须配置

```env
# 数据库连接
DATABASE_URL="postgresql://user:password@host:5432/solo_sales?sslmode=require"

# NextAuth 配置
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-secret-key"
```

### 可选配置（支付功能）

```env
# Stripe
STRIPE_PUBLIC_KEY="pk_test_xxx"
STRIPE_SECRET_KEY="sk_test_xxx"

# PayPal
PAYPAL_CLIENT_ID="xxx"
PAYPAL_CLIENT_SECRET="xxx"
```

---

## 生成 NEXTAUTH_SECRET

在终端中运行：

```bash
openssl rand -base64 32
```

---

## 数据库设置

### Supabase SQL Editor

如果自动迁移失败，可以手动在 Supabase SQL Editor 中执行以下步骤：

1. 创建扩展（如果需要）：
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

2. 创建表结构（参考 `prisma/schema.prisma`）

---

## 验证部署

部署完成后，访问以下页面验证：

- `/` - 首页
- `/demo` - 演示页面（无需登录）
- `/cart` - 购物车页面

---

## 常见问题

### Q: 部署后数据库连接失败？

A: 检查 `DATABASE_URL` 是否正确，确保包含 `?sslmode=require`

### Q: NEXTAUTH_URL 应该填什么？

A: 填入 Vercel 分配给你的域名，例如 `https://solo-sales-xxx.vercel.app`

### Q: 如何更新生产环境代码？

A: 只需将代码推送到 GitHub，Vercel 会自动重新部署

---

## 技术栈

- **框架**: Next.js 16.2.1
- **数据库**: PostgreSQL + Prisma 5
- **认证**: NextAuth.js v4
- **支付**: Stripe + PayPal
- **样式**: Tailwind CSS + shadcn/ui
