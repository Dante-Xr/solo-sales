# Deploy to Production Spec

## Why

需要将 SoloSales 独立站部署到互联网，让外部用户可以试用体验。推荐使用 Vercel + Supabase 方案。

## What Changes

- 创建生产环境配置文件 (`productions.env.example`)
- 创建部署文档 (`DEPLOYMENT.md`)
- 验证并优化 Next.js 生产配置
- 确保代码可以成功构建部署

## Impact

- Affected specs: public-demo-page (扩展验证)
- Affected code:
  - `next.config.ts` (可能需要调整)
  - `prisma/schema.prisma` (确认迁移兼容性)
  - 新增 `productions.env.example`
  - 新增 `DEPLOYMENT.md`

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Next.js 16 (Turbopack)                   │   │
│  │  /demo  /  /cart  /orders  /profile  /admin     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Supabase (PostgreSQL)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │   Users   │ │ Products  │ │  Orders  │              │
│  └──────────┘ └──────────┘ └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

## Environment Variables Required

### Database
- `DATABASE_URL` - Supabase PostgreSQL 连接字符串

### Authentication
- `NEXTAUTH_URL` - 生产环境 URL (如 https://solo-sales.vercel.app)
- `NEXTAUTH_SECRET` - 用于加密 JWT 的密钥

### Payment (Optional for demo)
- `STRIPE_PUBLIC_KEY` - Stripe 公钥
- `STRIPE_SECRET_KEY` - Stripe 私钥
- `PAYPAL_CLIENT_ID` - PayPal 客户端 ID
- `PAYPAL_CLIENT_SECRET` - PayPal 客户端密钥

## Deployment Steps

1. 注册 Supabase 并创建 PostgreSQL 数据库
2. 配置环境变量
3. 部署到 Vercel
4. 运行 Prisma 迁移
5. 验证部署

## Post-Deployment Verification

- [ ] 网站可访问
- [ ] `/demo` 页面正常显示
- [ ] 用户注册/登录功能正常
- [ ] 购物车功能正常
- [ ] 暗色模式切换正常
