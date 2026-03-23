# 轮播图搜索与导航增强 Spec

## Why
提升 TikTok 引流用户在首页的购物体验：提供商品搜索功能帮助用户快速找到商品，同时优化轮播图的交互体验（自动播放和手动切换）。

## What Changes
- 在轮播图下方或顶部添加商品搜索框组件
- 搜索框支持记忆用户最新 3 条搜索历史（存储在 localStorage）
- 轮播图在没有用户操作时，每 10 秒自动切换到下一张
- 在轮播图左右边缘添加上一张/下一张图标按钮

## Impact
- Affected specs: 首页布局、轮播图交互
- Affected code:
  - `src/app/page.tsx`
  - `src/components/storefront/*` (New or modify existing carousel)

## ADDED Requirements
### Requirement: 商品搜索框
The system SHALL provide a product search box on the homepage carousel area. The search box SHALL remember the user's latest 3 search inputs.

#### Scenario: Search and History
- **WHEN** user types in the search box and presses Enter
- **THEN** the search term is saved to localStorage history (max 3 entries, newest first)
- **WHEN** user focuses on the search box
- **THEN** a dropdown shows the latest 3 search terms
- **WHEN** user clicks a history item
- **THEN** the search box is populated with that term

### Requirement: 轮播图自动播放
The system SHALL auto-advance the carousel every 10 seconds when there is no user interaction. Clicking the previous/next buttons SHALL reset the auto-play timer.

#### Scenario: Auto-play
- **WHEN** user visits the home page
- **THEN** the carousel starts auto-advancing every 10 seconds
- **WHEN** user clicks the previous or next arrow button
- **THEN** the carousel navigates to the adjacent image and resets the 10-second timer

### Requirement: 轮播图导航按钮
The system SHALL display previous/next arrow buttons on the left and right edges of the carousel images.

#### Scenario: Navigation Buttons
- **WHEN** user hovers over or views the carousel
- **THEN** they see left and right arrow icons on the image edges
- **WHEN** user clicks the left arrow
- **THEN** the carousel shows the previous image
- **WHEN** user clicks the right arrow
- **THEN** the carousel shows the next image
