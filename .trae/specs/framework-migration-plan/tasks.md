# Tasks - 框架迁移计划

## Phase 1: 零成本修复 (v0.9.0) ✅ 已完成 (2026-04-13)

- [x] Task 1.1: 启用 next-themes 替代自建 ThemeProvider
  - [x] SubTask 1.1.1: 重写 `src/components/providers/ThemeProvider.tsx`，使用 next-themes
  - [x] SubTask 1.1.2: 简化 `src/app/layout.tsx`，移除 CombinedThemeAuthProvider
  - [x] SubTask 1.1.3: 移除各页面中的 `mounted` 状态检查（page.tsx, cart, search, product）
  - [x] SubTask 1.1.4: 验证主题切换、暗色模式、无 hydration 错误

- [x] Task 1.2: 启用 TanStack Query 替代手动 fetch
  - [x] SubTask 1.2.1: 创建 `src/lib/api-client.ts` API 客户端工具
  - [x] SubTask 1.2.2: 创建 `src/hooks/useProducts.ts` 商品查询 Hook
  - [x] SubTask 1.2.3: 创建 `src/hooks/useOrders.ts` 订单查询 Hook
  - [x] SubTask 1.2.4: 迁移 orders/page.tsx 数据获取为 useQuery
  - [x] SubTask 1.2.5: 迁移 orders/[id]/page.tsx 数据获取为 useQuery
  - [x] SubTask 1.2.6: 迁移 search/page.tsx 数据获取为 useQuery
  - [x] SubTask 1.2.7: 迁移 admin 页面数据获取为 useQuery
  - [x] SubTask 1.2.8: 验证缓存、DevTools、加载状态

## Phase 2: 安全修复 (v0.10.0) ✅ 已完成 (2026-04-13)

- [x] Task 2.1: Better Auth 替代双重认证体系
  - [x] SubTask 2.1.1: 安装 better-auth
  - [x] SubTask 2.1.2: 创建 `src/lib/auth.ts` Better Auth 配置
  - [x] SubTask 2.1.3: 创建 `src/app/api/auth/[...all]/route.ts` API 路由
  - [x] SubTask 2.1.4: 更新 Prisma Schema 添加 Better Auth 模型
  - [x] SubTask 2.1.5: 迁移前台认证（AuthProvider, useSession）
  - [x] SubTask 2.1.6: 迁移后台认证（adminAuth.ts, admin API 路由）
  - [x] SubTask 2.1.7: 迁移登录/注册组件
  - [x] SubTask 2.1.8: 验证前后台登录、权限检查、Token 安全

## Phase 3: 状态管理升级 (v0.11.0) ✅ 已完成 (2026-04-13)

- [x] Task 3.1: Zustand 替代 React Context
  - [x] SubTask 3.1.1: 安装 zustand
  - [x] SubTask 3.1.2: 创建 `src/stores/useCartStore.ts`
  - [x] SubTask 3.1.3: 创建 `src/stores/useWishlistStore.ts`
  - [x] SubTask 3.1.4: 更新所有消费文件 import（约8个）
  - [x] SubTask 3.1.5: 简化 layout.tsx，移除 CartProvider/WishlistProvider
  - [x] SubTask 3.1.6: 删除旧文件 CartContext.tsx, WishlistContext.tsx
  - [x] SubTask 3.1.7: 验证购物车、收藏、持久化、无 hydration 错误

## Phase 4: 国际化升级 (v0.12.0) ✅ 已完成 (2026-04-13)

- [x] Task 4.1: next-intl 替代自建 LanguageContext
  - [x] SubTask 4.1.1: 安装 next-intl
  - [x] SubTask 4.1.2: 提取翻译文件 `src/i18n/messages/zh.json` 和 `en.json`
  - [x] SubTask 4.1.3: 创建 `src/i18n/request.ts` next-intl 配置
  - [x] SubTask 4.1.4: 更新 next.config.ts 添加 next-intl 插件
  - [x] SubTask 4.1.5: 更新所有消费文件 import（约39个）
  - [x] SubTask 4.1.6: 删除旧文件 LanguageContext.tsx, translations.ts
  - [x] SubTask 4.1.7: 简化 layout.tsx，移除 LanguageProvider
  - [x] SubTask 4.1.8: 验证中英文切换、SSR 渲染、无 hydration 错误

## Phase 5: 管理后台重构 (v1.0.0)

- [ ] Task 5.1: Refine 替代自建管理后台
  - [ ] SubTask 5.1.1: 安装 @refinedev/core @refinedev/nextjs-router
  - [ ] SubTask 5.1.2: 创建 Refine 配置和数据提供者
  - [ ] SubTask 5.1.3: 迁移 admin/products 页面
  - [ ] SubTask 5.1.4: 迁移 admin/orders 页面
  - [ ] SubTask 5.1.5: 迁移 admin/users 页面
  - [ ] SubTask 5.1.6: 迁移其余 admin 页面
  - [ ] SubTask 5.1.7: 验证 CRUD 操作和权限控制

- [ ] Task 5.2: Tremor 替代 Recharts（管理后台）
  - [ ] SubTask 5.2.1: 安装 @tremor/react
  - [ ] SubTask 5.2.2: 替换 SalesChart 组件为 Tremor AreaChart
  - [ ] SubTask 5.2.3: 创建 KPI 卡片组件
  - [ ] SubTask 5.2.4: 验证图表渲染和暗色模式

## Task Dependencies
- Task 1.1 和 1.2 可并行执行
- Task 2.1 依赖 Task 1.1（ThemeProvider 稳定后再改认证）
- Task 3.1 依赖 Task 2.1（认证稳定后再改状态管理）
- Task 4.1 依赖 Task 3.1（状态管理稳定后再改国际化）
- Task 5.1 依赖 Task 2.1 + 4.1（认证和国际化就绪后再重构后台）
- Task 5.2 可与 5.1 并行执行
