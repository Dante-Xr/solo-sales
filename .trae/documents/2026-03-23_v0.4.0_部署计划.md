# SoloSales 独立站发布计划

## 概述

将 SoloSales 电商独立站部署到互联网，让用户可以试用体验。

## 当前技术栈

- **前端框架**: Next.js 16.2.1 (Turbopack)
- **数据库**: PostgreSQL (Prisma ORM)
- **认证**: NextAuth.js v4
- **支付**: Stripe + PayPal
- **样式**: Tailwind CSS + shadcn/ui

---

## 部署方案

### 方案一：Vercel + Supabase（推荐）

| 服务 | 用途 | 费用 |
|------|------|------|
| Vercel | Next.js 部署 | 免费 |
| Supabase | PostgreSQL 数据库 | 免费 (500MB) |

#### 实施步骤

**阶段 1：准备数据库**

1. 注册 [Supabase](https://supabase.com)
2. 创建新项目，获取 `DATABASE_URL`
3. 在 Supabase SQL Editor 中运行 Prisma 迁移

**阶段 2：配置环境变量**

在 Vercel 项目设置中添加以下环境变量：

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-generated-secret
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
```

**阶段 3：部署到 Vercel**

1. 注册 [Vercel](https://vercel.com)
2. 导入 GitHub 仓库
3. 配置环境变量
4. 点击 Deploy

**阶段 4：数据库迁移**

在 Vercel 部署完成后，运行 Prisma 迁移：

```bash
npx prisma migrate deploy
```

---

### 方案二：Railway（一体化部署）

Railway 提供 PostgreSQL + Next.js 部署一体化服务。

1. 注册 [Railway](https://railway.app)
2. 创建 PostgreSQL 插件
3. 部署 Next.js 应用
4. 配置环境变量

---

## 具体实施任务

### Task 1: 创建生产环境构建配置

- [ ] 创建 `productions.env.example` 示例文件
- [ ] 验证 `next.config.ts` 生产环境配置
- [ ] 确保图片域名配置支持生产环境

### Task 2: 生成必要的安全密钥

- [ ] 生成 `NEXTAUTH_SECRET`
- [ ] 准备 Stripe API 密钥（测试/生产）
- [ ] 准备 PayPal API 密钥

### Task 3: 创建部署文档

- [ ] 创建 `DEPLOYMENT.md` 部署指南
- [ ] 包含 Supabase 数据库设置步骤
- [ ] 包含 Vercel 部署步骤
- [ ] 包含环境变量配置说明

### Task 4: 准备 Git 部署

- [ ] 确保 `.gitignore` 正确排除敏感文件
- [ ] 创建 GitHub 仓库（如果尚未创建）

### Task 5: 数据库准备

- [ ] 在 Supabase 创建项目
- [ ] 获取连接字符串
- [ ] 测试数据库连接

### Task 6: Vercel 部署

- [ ] 连接 GitHub 仓库到 Vercel
- [ ] 配置所有环境变量
- [ ] 执行首次部署
- [ ] 运行 Prisma 迁移

### Task 7: 验证部署

- [ ] 访问部署的网站
- [ ] 测试 `/demo` 演示页面
- [ ] 测试用户注册/登录
- [ ] 测试购物车功能
- [ ] 验证暗色模式切换

---

## 注意事项

### 需要外部服务的密钥

1. **数据库**: Supabase / Neon / Railway
2. **Stripe**: https://dashboard.stripe.com/apikeys
3. **PayPal**: https://developer.paypal.com/apps

### 生产环境注意事项

1. 使用生产环境的 API 密钥
2. 启用数据库 SSL 连接
3. 配置正确的 `NEXTAUTH_URL`
4. 设置合理的速率限制

### 演示模式 vs 生产模式

- `/demo` 页面：无需后端，适合快速演示
- 完整功能：需要 PostgreSQL 数据库

---

## 快速开始

如果用户只是想快速演示给外部人员：

1. **最简方案**: 直接分享 `http://localhost:3000/demo`（仅限同一网络）
2. **推荐方案**: 部署到 Vercel + Supabase（如上所述）

---

## 文件清单

部署需要创建/修改的文件：

- `productions.env.example` - 环境变量示例
- `DEPLOYMENT.md` - 部署文档
- `.env.production` - （不提交，仅本地使用）
