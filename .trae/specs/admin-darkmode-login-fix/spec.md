# Admin 后台问题修复规格 (v0.5.6-hotfix)

## 一、背景与目标

### Why
当前 v0.4.x 后台管理系统存在两个未解决的问题：
1. 管理后台页面的切换夜间模式按钮无效
2. 访问 http://localhost:3000/admin 没有弹出登录界面

### What Changes
- **FIX-1**: 修复夜间模式切换按钮 - 改用自定义 ThemeProvider 的 useTheme
- **FIX-2**: 修复中间件路由匹配 - 正确匹配 `/admin` 和 `/admin/*`

---

## 二、影响范围

### Affected Code
- `src/components/admin/AdminLayout.tsx` (FIX-1)
- `src/proxy.ts` (FIX-2) - 替代原有的 `src/middleware.ts` (Next.js 16 迁移)

---

## 三、ADDED Requirements

### Requirement: 夜间模式切换
系统 SHALL 在管理后台页面正确切换夜间/白天模式。

#### Scenario: 点击夜间模式按钮
- **WHEN** 用户点击侧边栏顶部的Moon/Sun图标按钮
- **THEN** 系统应切换 `html` 元素的 `dark` class
- **AND** 按钮图标应从 Moon 变为 Sun（或相反）

#### Scenario: 夜间模式持久化
- **WHEN** 用户切换到夜间模式并刷新页面
- **THEN** 页面应保持夜间模式

### Requirement: 管理后台认证重定向
系统 SHALL 在用户未登录时正确重定向到登录页面。

#### Scenario: 未登录访问 /admin
- **WHEN** 用户直接访问 http://localhost:3000/admin 且没有有效的 admin_token cookie
- **THEN** 系统应重定向到 http://localhost:3000/admin/login
- **AND** 显示登录表单

#### Scenario: 已登录访问 /admin
- **WHEN** 用户直接访问 http://localhost:3000/admin 且有有效的 admin_token cookie
- **THEN** 系统应显示管理后台仪表盘

---

## 四、修复详情

### FIX-1: 夜间模式按钮修复

**问题根因**:
`AdminLayout.tsx` 第19行: `import { useTheme } from "next-themes"`
但项目使用的是自定义 `ThemeProvider`（`src/components/providers/ThemeProvider.tsx`），它有自己的 `useTheme` 导出

**修复方案**:
将 `AdminLayout.tsx` 第19行改为:
```typescript
import { useTheme } from "@/components/providers/ThemeProvider"
```

### FIX-2: Next.js 16 Proxy 迁移

**问题根因**:
在 Next.js 16 中，`middleware` 文件约定已被弃用并更名为 `proxy`。使用旧的 `middleware.ts` 文件可能导致认证逻辑不被正确执行。

**修复方案**:
1. 创建新文件 `src/proxy.ts`，导出 `proxy` 函数代替 `middleware` 函数
2. 删除旧的 `src/middleware.ts` 文件
3. 保持原有的认证逻辑和 matcher 配置不变

---

## 五、Breaking Changes

无破坏性变更。

---

*版本: v0.5.6-hotfix*
*创建日期: 2026-03-26*
