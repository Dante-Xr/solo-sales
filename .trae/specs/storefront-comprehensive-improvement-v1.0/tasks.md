# Tasks

## Phase 1: 基础数据与页面修复（P0 + P1 基础）

- [x] Task 1: 丰富商品数据（20+ 真实商品）
  - [x] 1.1 检查 Prisma schema 中 Product 模型完整性，补充缺失字段（stock, saleEndsAt, description, images, category, variants）
  - [x] 1.2 创建 `prisma/seed-products.ts` 脚本，生成 20+ 个真实商品数据（智能家居/数码配件品类为主）
  - [x] 1.3 运行 seed 脚本填充数据库
  - [x] 1.4 重构 `src/components/storefront/HomeCarousel.tsx`：移除硬编码 FEATURED_PRODUCTS，改为从 props 接收数据
  - [x] 1.5 重构 `src/components/storefront/ProductGrid.tsx`：移除对 HomeCarousel FEATURED_PRODUCTS 的依赖，改为从 props/API 获取
  - [x] 1.6 更新 `src/app/api/products/featured/route.ts`：从数据库查询精选商品而非返回静态数据

- [x] Task 2: 修复 Footer 空链接
  - [x] 2.1 创建 `src/app/[locale]/about/page.tsx` — 关于我们页面（基础内容 + SEO metadata）
  - [x] 2.2 创建 `src/app/[locale]/faq/page.tsx` — FAQ 页面（常见问题列表）
  - [x] 2.3 创建 `src/app/[locale]/privacy/page.tsx` — 隐私政策页面（GDPR/CCPA 合规文本）
  - [x] 2.4 验证 `src/components/storefront/StorefrontFooter.tsx` 中所有链接可正常跳转

- [x] Task 3: 添加 Skeleton Loading
  - [x] 3.1 确认 shadcn/ui Skeleton 组件已安装（`npx shadcn@latest add skeleton` 如需要）
  - [x] 3.2 为 `ProductGrid.tsx` 添加加载状态：6 个 Skeleton 卡片网格
  - [x] 3.3 为订单列表页 `src/app/[locale]/orders/page.tsx` 添加 Skeleton 行
  - [x] 3.4 为管理后台商品列表添加 Skeleton 加载状态

- [x] Task 4: 安装并配置 Sonner Toast 组件
  - [x] 4.1 执行 `npx shadcn@latest add sonner` 安装 Toast 组件
  - [x] 4.2 在 `src/app/[locale]/layout.tsx` 的 `<body>` 中包裹 `<Toaster />`
  - [x] 4.3 将 `EnhancedCheckoutModal.tsx` 中的 `alert()` 替换为 `toast.success()`

## Phase 2: 核心功能增强（P0 支付 + P1 结账）

- [x] Task 5: 完善结账流程 + 订单确认页
  - [x] 5.1 创建 `src/app/[locale]/orders/confirmation/[id]/page.tsx`
  - [x] 5.2 修改 `EnhancedCheckoutModal.tsx`：结账成功后使用 `router.push()` 跳转至确认页而非 alert
  - [x] 5.3 修改 `src/app/api/orders/route.ts`：创建订单后返回完整订单 ID 用于确认页路由
  - [x] 5.4 为订单确认页添加 SEO metadata 和 Open Graph 标签

- [x] Task 6: Stripe Live Mode 配置优化
  - [x] 6.1 审计 `src/app/api/checkout/stripe/route.ts`：确保支持环境变量切换 test/live mode
  - [x] 6.2 在 `.env.example` 中明确标注 Stripe/PayPal 必需的环境变量
  - [x] 6.3 在 `netlify.toml` 中添加生产环境变量占位符说明
  - [x] 6.4 为 PayPal Mock 模式添加明显的"演示模式"水印提示

## Phase 3: 首页 Server Component 化（P0 性能）

- [x] Task 7: 首页 Server Component 改造
  - [x] 7.1 创建 `src/components/storefront/HomeCarouselClient.tsx`：提取 HomeCarousel 中需要客户端交互的逻辑
  - [x] 7.2 创建 `src/components/storefront/ProductGridClient.tsx`：提取 ProductGrid 中客户端交互部分
  - [x] 7.3 创建 `src/components/storefront/SearchBoxClient.tsx`：提取 SearchBox 客户端逻辑
  - [x] 7.4 重构 `src/app/[locale]/page.tsx`：移除 `"use client"`，改为 Server Component
  - [x] 7.5 验证 `npm run build` 通过，无 SSR/hydration 错误

## Phase 4: 商品评价系统（P1）

- [x] Task 8: 商品评价系统
  - [x] 8.1 在 `prisma/schema.prisma` 中添加 Review 模型（已存在，无需修改）
  - [x] 8.2 运行 `npx prisma migrate dev --name add_reviews`（已存在）
  - [x] 8.3 创建 `src/app/api/reviews/route.ts`：GET（某商品评价列表）、POST（提交评价）
  - [x] 8.4 创建 `src/components/product/ProductReviews.tsx`
  - [x] 8.5 在 `src/app/[locale]/product/[id]/page.tsx` 中集成 ProductReviews 组件

## Phase 5: 商品详情页完善（P2）

- [x] Task 9: 商品详情页增强
  - [x] 9.1 创建 `src/components/product/ImageGallery.tsx`
  - [x] 9.2 创建 `src/components/product/VariantSelector.tsx`
  - [x] 9.3 创建 `src/components/product/RelatedProducts.tsx`
  - [x] 9.4 重构 `src/app/[locale]/product/[id]/page.tsx`

## Phase 6: 紧迫感元素（P2）

- [x] Task 10: 紧迫感元素组件
  - [x] 10.1 创建 `src/components/product/CountdownTimer.tsx`
  - [x] 10.2 创建 `src/components/product/StockBadge.tsx`
  - [x] 10.3 创建 `src/components/storefront/RecentPurchases.tsx`
  - [x] 10.4 在 ProductCard 中集成 StockBadge
  - [x] 10.5 在商品详情页集成 CountdownTimer + RecentPurchases

## Phase 7: 安全增强（P2）

- [x] Task 11: CSP Nonce-based 优化
  - [x] 11.1 创建 `src/lib/csp-nonce.ts` 工具函数
  - [x] 11.2 修改 `next.config.ts` 中的 CSP 配置
  - [x] 11.3 在 proxy.ts 中注入 nonce 到响应头
  - [x] 11.4 测试所有内联脚本和第三方脚本在 nonce 模式下正常工作

- [x] Task 12: CSRF 防护实现
  - [x] 12.1 创建 `src/lib/csrf.ts`
  - [x] 12.2 创建 CSRF 中间件函数 `src/middleware/csrf-guard.ts`
  - [x] 12.3 在 API 路由中集成 CSRF 验证
  - [x] 12.4 在前端表单中注入隐藏的 CSRF Token input 字段
  - [x] 12.5 创建 `src/hooks/useCsrfToken.ts` Hook

# Task Dependencies

- [Task 5] depends on [Task 4] ✅
- [Task 7] depends on [Task 1] ✅
- [Task 8] depends on [Task 1] ✅
- [Task 9] depends on [Task 1] ✅
- [Task 10] depends on [Task 9] ✅
- [Task 12] depends on [Task 5] ✅
