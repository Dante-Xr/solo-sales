# Vercel 快速部署 Spec

## Why

需要立刻将 SoloSales 独立站部署到 Vercel，获得公网可访问的 URL。

## What Changes

- 验证 GitHub 仓库状态
- 确保代码可部署
- 提供 Vercel 部署步骤

## Deployment Flow

```
GitHub Push → Vercel Build → Supabase DB → Live URL
```

## Required Steps (User Actions)

1. **推送代码到 GitHub**（如果尚未推送）
2. **Vercel 导入项目**
3. **配置环境变量**
4. **部署完成获取 URL**

## Environment Variables for Vercel

| 变量名 | 说明 | 来源 |
|--------|------|------|
| `DATABASE_URL` | Supabase PostgreSQL 连接字符串 | Supabase Dashboard |
| `NEXTAUTH_URL` | Vercel 分配的域名 | 部署后自动获取 |
| `NEXTAUTH_SECRET` | JWT 密钥 | 本地生成 |

## Verification Checklist

- [ ] GitHub 仓库已创建并推送
- [ ] Vercel 已导入项目
- [ ] 环境变量已配置
- [ ] 部署成功
- [ ] 公网 URL 可访问
- [ ] `/demo` 页面正常
