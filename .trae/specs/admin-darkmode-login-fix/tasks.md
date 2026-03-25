# Admin 后台问题修复任务清单 (v0.5.6)

## 问题修复

### FIX-1: 夜间模式按钮修复
- [x] FIX-1.1: 修改 AdminLayout.tsx 的 useTheme 导入
  - 将 `import { useTheme } from "next-themes"` 改为 `import { useTheme } from "@/components/providers/ThemeProvider"`
  - 验证 TypeScript 编译通过

### FIX-2: Next.js 16 Proxy 迁移
- [x] FIX-2.1: 将 middleware.ts 迁移到 proxy.ts (Next.js 16)
  - 在 Next.js 16 中，`middleware` 文件约定已弃用并更名为 `proxy`
  - 创建 `src/proxy.ts` 文件，导出 `proxy` 函数代替 `middleware` 函数
  - 删除旧的 `src/middleware.ts` 文件
  - 验证 TypeScript 编译通过

## 验证任务

- [x] 验证夜间模式按钮可以正常工作
  - useTheme 现在从正确的 ThemeProvider 导入
  - 按钮可以触发主题切换
- [x] 验证访问 /admin 会正确重定向到登录页
  - proxy.ts 中的认证逻辑正确
  - 未登录用户会被重定向到 /admin/login
- [x] 验证登录后可以正常访问 /admin
  - 已登录用户可以直接访问仪表盘
- [x] 验证 TypeScript 编译通过 (`npx tsc --noEmit`)
- [x] 更新 package.json 版本号为 0.5.6

---

*版本: v0.5.6-hotfix*
*创建日期: 2026-03-26*
