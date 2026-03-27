# 首页点击功能修复 v0.8.1

## Why
v0.8.0 版本发布后，首页所有点击功能失效（轮播卡片点击、商品卡片点击等），用户体验完全中断。

## What Changes
- 移除 HomeCarousel.tsx 中 Image 组件错误添加的 `pointer-events-none`
- 移除 ProductGrid.tsx 中 Image 组件错误添加的 `pointer-events-none`
- 修复 WelcomeModal.tsx 中关闭按钮定位问题（添加 position: relative）

## Impact
- 受影响规格：homepage-pc-redesign-v0.8.0
- 受影响代码：
  - src/components/storefront/HomeCarousel.tsx
  - src/components/storefront/ProductGrid.tsx
  - src/components/storefront/WelcomeModal.tsx

## 问题根因分析

### 直接原因
在 HomeCarousel 和 ProductGrid 的 Image 组件上错误添加了 `pointer-events-none`:
```jsx
<Image className="object-cover pointer-events-none" />
```

### 原始设计
- v0.6.2 版本中，Card 组件的 `onClick` 处理器正常工作的原因是 Card 是可点击的容器
- Card 组件使用 `<div data-slot="card" ...>`，支持原生的 onClick 事件
- Image 使用 fill 属性但 onClick 是加在 Card 容器上，所以点击应该正常工作

### v0.8.0 的变更
- HomeCarousel.tsx 中 Image 添加了 `pointer-events-none`（错误修复尝试）
- ProductGrid.tsx 中 Image 添加了 `pointer-events-none`（错误修复尝试）
- ProductGrid.tsx 将 Card 组件改为 button 元素

### 正确解决方案
- 移除所有 `pointer-events-none`
- 确保 Card/button 组件的 onClick 正常工作
- Image fill 属性不会拦截同级的 onClick 事件（它们在不同的层级）

## ADDED Requirements
### Requirement: 首页点击功能恢复正常
所有首页元素点击功能应正常工作，包括轮播卡片导航、商品卡片跳转、导航链接。

#### Scenario: 轮播卡片点击
- **WHEN** 用户点击轮播卡片
- **THEN** 跳转到对应商品详情页 `/product/{id}`

#### Scenario: 商品卡片点击
- **WHEN** 用户点击商品网格中的商品卡片
- **THEN** 跳转到对应商品详情页 `/product/{id}`

## MODIFIED Requirements
### Requirement: WelcomeModal 定位修复
关闭按钮必须正确定位在 modal 卡片右上角。

#### Scenario: 关闭按钮定位
- **WHEN** WelcomeModal 显示
- **THEN** 关闭按钮 (X) 正确显示在 modal 卡片右上角，点击可关闭 modal
