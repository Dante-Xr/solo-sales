# Checklist - 框架迁移计划

## Phase 1: 零成本修复 (v0.9.0)

### next-themes 替换
- [ ] ThemeProvider.tsx 已替换为 next-themes
- [ ] layout.tsx 已简化，移除 CombinedThemeAuthProvider
- [ ] 各页面 mounted 状态检查已移除
- [ ] 主题切换正常（亮/暗/系统）
- [ ] 无 hydration 错误
- [ ] ESLint 检查通过

### TanStack Query 启用
- [ ] api-client.ts 已创建
- [ ] useProducts.ts Hook 已创建
- [ ] useOrders.ts Hook 已创建
- [ ] orders/page.tsx 已迁移为 useQuery
- [ ] orders/[id]/page.tsx 已迁移为 useQuery
- [ ] search/page.tsx 已迁移为 useQuery
- [ ] admin 页面已迁移为 useQuery
- [ ] 缓存生效（切换页面不重复请求）
- [ ] React Query DevTools 可用
- [ ] ESLint 检查通过

## Phase 2: 安全修复 (v0.10.0)

### Better Auth 替换
- [ ] better-auth 已安装
- [ ] auth.ts 配置已创建（含 admin + 2FA 插件）
- [ ] API 路由已创建
- [ ] Prisma Schema 已更新
- [ ] 前台认证已迁移（AuthProvider, useSession）
- [ ] 后台认证已迁移（adminAuth.ts 已重写）
- [ ] 登录/注册组件已迁移
- [ ] Admin Token 不可伪造（HMAC 签名）
- [ ] 硬编码测试用户已移除
- [ ] 前后台登录正常
- [ ] 权限检查正常
- [ ] ESLint 检查通过

## Phase 3: 状态管理升级 (v0.11.0)

### Zustand 替换
- [ ] zustand 已安装
- [ ] useCartStore.ts 已创建（含 persist middleware）
- [ ] useWishlistStore.ts 已创建（含 persist middleware）
- [ ] 所有消费文件 import 已更新
- [ ] layout.tsx 已简化（移除 CartProvider/WishlistProvider）
- [ ] 旧文件 CartContext.tsx 已删除
- [ ] 旧文件 WishlistContext.tsx 已删除
- [ ] 购物车功能正常（添加/删除/更新/持久化）
- [ ] 收藏功能正常
- [ ] 无 hydration 错误
- [ ] ESLint 检查通过

## Phase 4: 国际化升级 (v0.12.0)

### next-intl 替换
- [ ] next-intl 已安装
- [ ] zh.json 翻译文件已创建
- [ ] en.json 翻译文件已创建
- [ ] i18n/request.ts 配置已创建
- [ ] next.config.ts 已更新
- [ ] 所有消费文件 import 已更新
- [ ] 旧文件 LanguageContext.tsx 已删除
- [ ] 旧文件 translations.ts 已删除
- [ ] layout.tsx 已简化（移除 LanguageProvider）
- [ ] 中英文切换正常
- [ ] SSR 渲染正确
- [ ] 无 hydration 错误
- [ ] ESLint 检查通过

## Phase 5: 管理后台重构 (v1.0.0)

### Refine 替换
- [ ] @refinedev/core 已安装
- [ ] Refine 配置已创建
- [ ] 数据提供者已创建
- [ ] admin/products 页面已迁移
- [ ] admin/orders 页面已迁移
- [ ] admin/users 页面已迁移
- [ ] 其余 admin 页面已迁移
- [ ] CRUD 操作正常
- [ ] 权限控制正常

### Tremor 替换
- [ ] @tremor/react 已安装
- [ ] SalesChart 已替换为 Tremor 组件
- [ ] KPI 卡片已创建
- [ ] 图表渲染正常
- [ ] 暗色模式兼容
- [ ] ESLint 检查通过
