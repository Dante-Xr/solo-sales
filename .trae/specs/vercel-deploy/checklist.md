# Vercel 部署检查清单

## 本地验证

- [x] `npm run build` 成功
- [x] 没有 TypeScript 错误
- [x] Git 状态正常

## GitHub 准备

- [ ] 创建 GitHub 仓库
- [ ] 添加 remote: `git remote add origin https://github.com/用户名/solo-sales.git`
- [ ] 推送代码: `git push -u origin master`

## Vercel 配置

- [ ] 访问 https://vercel.com 登录
- [ ] 导入 GitHub 仓库
- [ ] 配置环境变量（见下方）
- [ ] 点击 Deploy

## 环境变量（Vercel 控制面板添加）

| 变量名 | 值 |
|--------|-----|
| `DATABASE_URL` | `postgresql://postgres.xxx:password@aws-0-xxx.pooler.supabase.com:6543/postgres?sslmode=require` |
| `NEXTAUTH_URL` | `https://你的项目名.vercel.app` |
| `NEXTAUTH_SECRET` | `o8qghl8UPLy3UwXlMKEmknmJNBSkqv364eAwNZjWWiM=` |

## 部署验证

- [ ] 部署成功
- [ ] 公网 URL 可访问
- [ ] `/demo` 页面正常显示

## 快速命令

```powershell
# 1. 创建 GitHub 仓库后，添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/solo-sales.git

# 2. 推送代码
git push -u origin master

# 3. 生成 NEXTAUTH_SECRET（已在上面生成）
openssl rand -base64 32
```

## 已生成的密钥

```
NEXTAUTH_SECRET=o8qghl8UPLy3UwXlMKEmknmJNBSkqv364eAwNZjWWiM=
```

将此密钥复制到 Vercel 环境变量中。
