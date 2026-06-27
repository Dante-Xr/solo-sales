#!/bin/bash
# ============================================
# 颜色硬编码批量修复脚本
# ============================================
# 创建时间：2026-06-27 04:45:00 +08:00
# 创建依据：三专家诊断报告 - P0优先级
# 功能：批量修复所有组件中的硬编码颜色
# ============================================

echo "🎨 开始批量修复颜色硬编码..."

# 已完成文件计数
FIXED_COUNT=6

# 剩余文件列表
REMAINING_FILES=(
  "src/components/admin/ReviewManagement.tsx"
  "src/components/admin/SalesChart.tsx"
  "src/components/storefront/ShareMenu.tsx"
  "src/components/storefront/SearchBoxClient.tsx"
  "src/components/storefront/SearchBox.tsx"
  "src/components/storefront/FeatureSection.tsx"
  "src/components/storefront/HeroBanner.tsx"
  "src/components/storefront/RecentPurchases.tsx"
  "src/components/storefront/StorefrontFooter.tsx"
  "src/components/storefront/SearchFilterSidebar.tsx"
  "src/components/product/ProductReviews.tsx"
  "src/components/product/ReviewForm.tsx"
  "src/components/product/ReviewCard.tsx"
  "src/components/product/UrgencyWidget.tsx"
  "src/components/checkout/CouponInput.tsx"
  "src/components/auth/LoginForm.tsx"
  "src/components/auth/RegisterForm.tsx"
  "src/components/order/TrackingTimeline.tsx"
  "src/components/points/PointsBalance.tsx"
  "src/components/points/PointsHistory.tsx"
  "src/components/logistics/LogisticsCard.tsx"
  "src/components/analytics/AnalyticsDashboard.tsx"
  "src/components/PWAProvider.tsx"
  "src/components/admin/advanced/InventoryAlert.tsx"
  "src/components/admin/advanced/VariantManager.tsx"
  "src/components/admin/advanced/AuditLog.tsx"
  "src/components/admin/products/StockAdjuster.tsx"
  "src/components/admin/products/ProductRow.tsx"
  "src/components/admin/products/BatchDiscountModal.tsx"
  "src/components/admin/layout/FavoritesList.tsx"
  "src/components/admin/layout/FavoriteButton.tsx"
  "src/components/admin/charts/MetricSelector.tsx"
)

echo "📊 进度: $FIXED_COUNT/38 已完成 ($(( FIXED_COUNT * 100 / 38 ))%)"
echo "📋 剩余: ${#REMAINING_FILES[@]} 个文件"
echo ""

# 颜色映射规则
declare -A COLOR_MAP=(
  ["text-green-500"]="text-success"
  ["text-green-600"]="text-success"
  ["text-green-700"]="text-success"
  ["text-orange-500"]="text-accent"
  ["text-orange-600"]="text-accent"
  ["text-orange-700"]="text-accent"
  ["text-blue-500"]="text-brand"
  ["text-blue-600"]="text-brand"
  ["text-blue-700"]="text-brand"
  ["text-yellow-500"]="text-warning"
  ["text-yellow-600"]="text-warning"
  ["bg-green-50"]="bg-success/10"
  ["bg-green-100"]="bg-success/10"
  ["bg-orange-50"]="bg-accent/10"
  ["bg-orange-100"]="bg-accent/10"
  ["bg-blue-50"]="bg-brand/10"
  ["bg-blue-100"]="bg-brand/10"
  ["bg-yellow-50"]="bg-warning/10"
  ["bg-yellow-100"]="bg-warning/10"
)

echo "✅ 颜色映射规则已加载 (${#COLOR_MAP[@]} 条)"
echo ""
echo "🚀 准备批量处理..."
echo "   (此脚本为框架，实际修复需逐个文件验证)"

# 注意：实际执行时需要：
# 1. 逐个文件检查上下文
# 2. 添加中文注释头部
# 3. 验证构建
# 4. 提交Git

echo ""
echo "📝 完成后需更新: .trae/color-fix-progress.md"
