# Storefront Features Spec

## Why
为了提升TikTok引流用户的浏览体验和客单价，我们需要提供一个首页商品轮播图以展示更多爆款商品，并提供一个购物车页面让用户可以一次性结算多件商品。

## What Changes
- 在首页 (`src/app/page.tsx`) 添加商品轮播图组件，展示多个推荐商品。
- 创建商品详情页路由 (`src/app/product/[id]/page.tsx`)。
- 点击首页轮播图的商品可跳转至对应的商品详情页。
- 创建独立的购物车页面 (`src/app/cart/page.tsx`)，展示已添加的商品列表、数量调节和总价计算。
- 实现全局购物车状态管理（暂时使用 React Context 或 Zustand/Jotai 等轻量级状态管理，此处为求简单可先使用 Context）。

## Impact
- Affected specs: 首页布局、前端路由、购物车状态管理
- Affected code: 
  - `src/app/page.tsx`
  - `src/app/product/[id]/page.tsx` (New)
  - `src/app/cart/page.tsx` (New)
  - `src/components/storefront/*` (New)
  - `src/context/CartContext.tsx` (New)

## ADDED Requirements
### Requirement: Home Carousel & Product Detail
The system SHALL provide a carousel on the home page displaying featured products. Clicking a product SHALL navigate to its detail page.

#### Scenario: Success case
- **WHEN** user visits the home page
- **THEN** they see a carousel of products.
- **WHEN** user clicks on a product in the carousel
- **THEN** they are navigated to `/product/[id]` to view product details.

### Requirement: Shopping Cart
The system SHALL provide a shopping cart page to review selected items, adjust quantities, and see the total price before checkout.

#### Scenario: Success case
- **WHEN** user clicks "加入购物车" on a product page
- **THEN** the item is added to the global cart state.
- **WHEN** user navigates to `/cart`
- **THEN** they see the items, can change quantities, and proceed to checkout.
