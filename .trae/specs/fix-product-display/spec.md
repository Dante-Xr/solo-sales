# 修复商品列表和详情不显示问题 + 移动端布局优化 Spec

## Why
商品列表和详情页面无法正常显示，根本原因是数据库中没有商品数据。项目已有 proxy.ts 正确配置了 next-intl 国际化中间件，但数据库需要初始化商品数据。

此外，商品详情页在移动端（手机端）的布局存在多个问题：
1. 图片画廊比例不适合手机屏幕，缩略图太小
2. 购买按钮并排显示，在窄屏幕上难以点击
3. 缺少底部固定购买栏，用户需要滚动到顶部才能购买
4. 描述文字过长，没有折叠功能
5. 信任徽章在移动端排列混乱
6. 间距和字体大小在移动端不协调

## What Changes
- 运行 Prisma 数据库迁移
- 运行商品数据种子脚本初始化商品数据
- 修复 Unsplash 图片 URL 404 问题，替换为 picsum.photos
- 清除 Redis 缓存
- 优化 ImageGallery 移动端布局（aspect-square、缩略图尺寸）
- 添加移动端底部固定购买栏（sticky bottom bar）
- 优化按钮布局（移动端垂直堆叠）
- 添加描述折叠/展开功能
- 优化 TrustBar 移动端布局（grid 2列）
- 调整移动端字体大小和间距
- 增大 StockBadge 尺寸
- 添加 iPhone 安全区域支持

## Impact
- Affected specs: 数据库数据、页面显示、移动端用户体验
- Affected code: 
  - `src/app/[locale]/product/[id]/page.tsx`
  - `src/components/product/ImageGallery.tsx`
  - `src/components/product/TrustBadges.tsx`
  - `src/components/product/StockBadge.tsx`
  - `src/components/product/RelatedProducts.tsx`
  - `src/app/globals.css`
  - `src/i18n/messages/zh.json`
  - `src/i18n/messages/en.json`

## ADDED Requirements
### Requirement: 数据库初始化
系统 SHALL 提供完整的商品数据初始化流程。

#### Scenario: 数据库迁移
- **WHEN** 运行 prisma db push
- **THEN** 数据库表结构应正确创建

#### Scenario: 商品数据初始化
- **WHEN** 运行 seed 脚本
- **THEN** 数据库应有 24 个商品和 4 个分类

### Requirement: 移动端底部固定购买栏
系统 SHALL 在移动端显示底部固定的购买操作栏。

#### Scenario: 用户滚动页面
- **WHEN** 用户在移动端滚动商品详情页
- **THEN** 底部应始终显示价格和购买按钮

### Requirement: 描述折叠功能
系统 SHALL 在移动端提供商品描述的折叠/展开功能。

#### Scenario: 描述过长
- **WHEN** 商品描述超过120字符
- **THEN** 应显示"显示更多"按钮，点击后展开完整描述

## MODIFIED Requirements
### Requirement: 图片画廊响应式
图片画廊 SHALL 在移动端使用正方形比例，在PC端使用4:3比例。

### Requirement: 购买按钮响应式
购买按钮 SHALL 在移动端垂直堆叠显示，在PC端并排显示。

## REMOVED Requirements
无
