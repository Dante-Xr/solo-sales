# 颜色硬编码批量修复记录

## 修改时间
2026-06-27 04:00:00 → 进行中

## 修改依据
- 三专家诊断报告 - UI设计师建议
- 优先级: P0（紧急）
- 目标: 品牌一致性100%

## 映射规则
```
增长/成功 → success (绿色语义保留)
下降/危险 → accent (红色)
品牌/主要 → brand (Klein Blue)
警告 → warning (黄色语义保留)
信息 → info (蓝色)
```

## 已完成文件

### 1. src/components/product/SocialProof.tsx ✅
**时间**: 04:00:00  
**修改**: 7处颜色  
- orange (热门) → accent
- green (销量) → success  
- orange (浏览) → brand

### 2. src/components/product/TrustBadges.tsx ✅
**时间**: 04:05:00  
**修改**: 4处颜色映射  
- green-50/700 → success/10 + success
- blue-50/700 → brand/10 + brand
- purple-50/700 → info/10 + info
- orange-50/700 → accent/10 + accent

### 3. src/components/admin/KpiCard.tsx ✅
**时间**: 04:05:00  
**修改**: 趋势指标颜色  
- green-600 (increase) → success
- red-600 (decrease) → accent
- gray-600 (unchanged) → muted-foreground

## 待修复文件 (35个)

### 高频使用组件 (优先)
- [ ] src/components/admin/BatchActionBar.tsx
- [ ] src/components/admin/MobileProductCard.tsx
- [ ] src/components/admin/ProductRow.tsx
- [ ] src/components/admin/ReviewManagement.tsx
- [ ] src/components/admin/SalesChart.tsx

### 前台组件
- [ ] src/components/storefront/ShareMenu.tsx
- [ ] src/components/storefront/SearchBoxClient.tsx
- [ ] src/components/storefront/SearchBox.tsx
- [ ] src/components/storefront/FeatureSection.tsx
- [ ] src/components/storefront/HeroBanner.tsx
- [ ] src/components/storefront/RecentPurchases.tsx
- [ ] src/components/storefront/StorefrontFooter.tsx
- [ ] src/components/storefront/SearchFilterSidebar.tsx

### 产品相关
- [ ] src/components/product/ProductReviews.tsx
- [ ] src/components/product/ReviewForm.tsx
- [ ] src/components/product/ReviewCard.tsx
- [ ] src/components/product/UrgencyWidget.tsx

### 其他功能模块
- [ ] src/components/checkout/CouponInput.tsx
- [ ] src/components/auth/LoginForm.tsx
- [ ] src/components/auth/RegisterForm.tsx
- [ ] src/components/order/TrackingTimeline.tsx
- [ ] src/components/points/PointsBalance.tsx
- [ ] src/components/points/PointsHistory.tsx
- [ ] src/components/logistics/LogisticsCard.tsx
- [ ] src/components/analytics/AnalyticsDashboard.tsx
- [ ] src/components/PWAProvider.tsx

### 管理后台高级功能
- [ ] src/components/admin/advanced/InventoryAlert.tsx
- [ ] src/components/admin/advanced/VariantManager.tsx
- [ ] src/components/admin/advanced/AuditLog.tsx
- [ ] src/components/admin/products/StockAdjuster.tsx
- [ ] src/components/admin/products/ProductRow.tsx
- [ ] src/components/admin/products/BatchDiscountModal.tsx
- [ ] src/components/admin/layout/FavoritesList.tsx
- [ ] src/components/admin/layout/FavoriteButton.tsx
- [ ] src/components/admin/charts/MetricSelector.tsx

## 进度统计
- 已完成: 3/38 (8%)
- 待完成: 35/38 (92%)
- 预计剩余时间: 3-4小时

## 下一批目标 (按影响范围排序)
1. 管理后台高频组件 (5个) - 1小时
2. 前台展示组件 (7个) - 1.5小时
3. 其他功能模块 (23个) - 2小时
