# 首页 PC 重构 v0.8.0 Spec

## Why
商城首页目前采用移动端优先设计 (`max-w-md`)，在 PC 端显示效果不佳。需要改造为 PC 端优化布局，参考 Shopify Zap Theme (Portable 预设) 的极简现代美学风格，提升品牌形象和用户体验。

## What Changes
- 重构首页布局容器，移除移动端限制，采用响应式 PC 布局
- 重构 Header 导航栏为水平布局
- 重构 Hero Section 为全宽轮播
- 重构商品展示区域为 4 列网格
- 新增 Feature/Benefits 区块
- 新增 Footer 区域
- 保持移动端响应式适配

## Impact
- Affected specs: storefront-features
- Affected code:
  - `src/app/page.tsx`
  - `src/components/storefront/HomeCarousel.tsx`
  - `src/components/storefront/SearchBox.tsx`

## ADDED Requirements

### Requirement: PC 端优化布局
系统 SHALL 提供 PC 端优化的首页布局，最大宽度 1440px，居中显示。

#### Scenario: PC 端访问
- **WHEN** 用户在桌面端访问首页
- **THEN** 展示 PC 端布局，宽度最大 1440px，居中显示

### Requirement: 现代化 Header 导航
系统 SHALL 提供水平布局的导航栏，Logo 居左，导航居中，操作按钮居右。

#### Scenario: 导航栏显示
- **WHEN** 用户访问首页
- **THEN** Header 展示 Logo、导航菜单、搜索框、用户菜单、购物车

### Requirement: 全宽 Hero 轮播
系统 SHALL 提供全宽轮播图作为首页 Hero 区域。

#### Scenario: 轮播展示
- **WHEN** 用户访问首页
- **THEN** 轮播图占据全宽，高度 400-500px，自动播放

### Requirement: 4 列商品网格
系统 SHALL 提供 4 列商品网格展示区域。

#### Scenario: 商品展示
- **WHEN** 用户浏览首页商品
- **THEN** 商品以 4 列网格展示，卡片更大，悬停效果增强

### Requirement: Feature 特性区块
系统 SHALL 提供特性介绍区块，展示品牌优势。

#### Scenario: 特性展示
- **WHEN** 用户浏览首页
- **THEN** 看到 4 列特性区域（快速响应、安全支付、免费退货、24/7 支持）

### Requirement: Footer 区域
系统 SHALL 提供多列 Footer 区域。

#### Scenario: Footer 显示
- **WHEN** 用户滚动到页面底部
- **THEN** 看到 Footer 包含链接区域、Newsletter 订阅、社交媒体链接

## MODIFIED Requirements

### Requirement: 响应式布局
原有移动端优先布局 MODIFIED 为响应式布局，保持移动端体验的同时优化 PC 端显示。

## REMOVED Requirements
无

## 设计风格参考
- Shopify Zap Theme Portable 预设
- 极简布局 - 大量留白，bold 字体排版
- 全宽区块 - Full-width sections，干净利落的网格
- 现代美学 - Contemporary aesthetic，精致排版
