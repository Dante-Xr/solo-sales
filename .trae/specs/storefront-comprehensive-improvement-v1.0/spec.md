# SoloSales 独立站全面优化 Spec

## Why

SoloSales 当前存在以下核心问题，严重影响独立站的运营能力和转化率：

1. **商品数据为 Mock**：仅 3 个硬编码 Mock 商品，无法实际运营
2. **支付流程不完整**：PayPal 为 Mock 模式，结账后用 alert 提示
3. **首页全客户端渲染**：`"use client"` 导致 SEO 不友好、首屏加载慢
4. **缺少社交证明**：无评价系统、无紧迫感元素
5. **安全防护不足**：CSP 过于宽松、缺少 CSRF 防护
6. **Footer 链接空缺**：About/FAQ/Privacy 页面不存在

## What Changes

### P0 - 必须立即实施

- **丰富商品数据**：从 3 个 Mock 商品扩展至 20+ 真实商品数据，统一从数据库获取
- **接入真实支付**：Stripe 切换 Live Mode，移除或完善 PayPal Mock
- **首页 Server Component 化**：将首页改为服务端渲染，提升 SEO 和首屏性能

### P1 - 用户体验提升

- **添加商品评价系统**：Review 模型 + API + 前端组件（评分/评论/平均分）
- **完善结账流程**：替换 alert 为 Toast，新增订单确认页 `/orders/confirmation/[id]`
- **添加 Skeleton Loading**：数据加载时显示骨架屏而非空白闪烁
- **修复 Footer 空链接**：创建 About/FAQ/Privacy 占位页或移除空链接

### P2 - 安全与性能

- **完善商品详情页**：多图画廊 + 规格选择器 + 相关推荐
- **添加紧迫感元素**：倒计时/库存提示/实时购买通知
- **CSP 策略优化**：从 unsafe-inline 迁移到 nonce-based CSP
- **CSRF 防护**：对状态变更 API 添加 CSRF Token 验证

### P3 - 长期优化（本 Spec 不包含，后续迭代）

- 品牌视觉升级、PWA 完整实现、博客/内容营销区

## Impact

- Affected specs: ecommerce-auth-checkout, integrate-payment, performance-optimization-v0.2.1, storefront-features
- Affected code:
  - `src/app/[locale]/page.tsx` — 首页重构
  - `src/components/storefront/HomeCarousel.tsx` — 商品数据源切换
  - `src/components/storefront/ProductGrid.tsx` — 商品数据源切换
  - `src/components/checkout/EnhancedCheckoutModal.tsx` — 结账体验改进
  - `src/app/api/checkout/stripe/route.ts` — 支付配置
  - `src/app/api/checkout/paypal/route.ts` — PayPal 处理
  - `src/app/api/orders/route.ts` — 订单创建
  - `prisma/schema.prisma` — 数据模型扩展
  - `next.config.ts` — CSP 配置优化
  - `src/components/storefront/StorefrontFooter.tsx` — Footer 修复

---

## ADDED Requirements

### Requirement: 商品数据管理

系统 SHALL 提供完整的商品数据管理能力，包括至少 20 个真实商品数据，支持从数据库动态获取。

#### Scenario: 首页展示真实商品
- **WHEN** 用户访问首页
- **THEN** 系统从数据库获取并展示精选商品列表（轮播 + 网格）
- **AND** 商品信息包含：名称、价格、原价、图片 URL、销量、描述

#### Scenario: 商品详情页展示完整信息
- **WHEN** 用户点击某个商品
- **THEN** 展示商品详情页，包含多图画廊、规格选择器、相关推荐

---

### Requirement: 支付流程完整性

系统 SHALL 提供完整的支付流程，支持 Stripe Live Mode 支付，并在支付成功后跳转至订单确认页。

#### Scenario: Stripe 实名支付
- **WHEN** 用户选择 Stripe 支付方式并提交订单
- **THEN** 系统调用 Stripe API 创建 Checkout Session 并重定向到 Stripe 托管页面
- **AND** 支付成功后回调更新订单状态

#### Scenario: 订单确认页
- **WHEN** 订单创建成功
- **THEN** 自动跳转至 `/orders/confirmation/[id]`
- **AND** 展示订单号、商品摘要、预计送达时间、推荐商品

---

### Requirement: 首页性能优化

系统 SHALL 将首页改为 Server Component，实现服务端渲染以提升 SEO 和首屏加载速度。

#### Scenario: 服务端渲染首页
- **WHEN** 用户访问首页
- **THEN** HTML 在服务端生成并返回给客户端
- **AND** 客户端交互部分通过 Client Component 实现

---

### Requirement: 商品评价系统

系统 SHALL 提供商品评价功能，支持用户对已购买商品进行评分和评论。

#### Scenario: 查看商品评价
- **WHEN** 用户访问商品详情页
- **THEN** 显示该商品的评分星级、评论列表和平均分统计

#### Scenario: 发表评价
- **WHEN** 已购买用户在订单详情页点击"发表评价"
- **THEN** 弹出评价表单（1-5 星级 + 文字评论），提交后保存至数据库

---

### Requirement: 结账体验优化

系统 SHALL 使用 Toast 替代 alert 提供更好的用户反馈，并提供完整的订单确认页面。

#### Scenario: 结账成功 Toast 通知
- **WHEN** 用户完成结账操作
- **THEN** 显示成功 Toast 通知（非 alert 弹窗）
- **AND** 2 秒后自动跳转至订单确认页

---

### Requirement: Skeleton Loading

系统 SHALL 在数据加载期间显示骨架屏占位符，避免空白闪烁。

#### Scenario: 商品列表加载状态
- **WHEN** 商品数据正在从服务器获取
- **THEN** 显示 6 个 Skeleton 卡片作为占位符
- **AND** 数据到达后平滑过渡到真实内容

---

### Requirement: Footer 链接修复

系统 SHALL 确保 Footer 中所有链接指向有效页面。

#### Scenario: Footer 导航链接可用
- **WHEN** 用户点击 Footer 中的"关于我们"/"FAQ"/"隐私政策"
- **THEN** 跳转到对应的有效页面（至少包含基础内容）

---

### Requirement: 紧迫感元素

系统 SHALL 在商品页面和卡片上显示紧迫感元素，促进转化。

#### Scenario: 库存紧张提示
- **WHEN** 某商品库存低于阈值（如 < 10 件）
- **THEN** 显示"仅剩 X 件"红色标签

#### Scenario: 限时促销倒计时
- **WHEN** 商品设置了促销结束时间
- **THEN** 显示距离结束的倒计时（天:时:分:秒）

#### Scenario: 实时购买通知
- **WHEN** 用户浏览商品页面
- **THEN** 页面底部随机滚动显示"XX 地区的用户刚购买了 YY"

---

### Requirement: CSP 安全增强

系统 SHALL 使用 nonce-based Content Security Policy 替代当前的 unsafe-inline 策略。

#### Scenario: CSP Nonce 注入
- **WHEN** 请求到达服务端
- **THEN** 生成随机 nonce 并注入到响应头 CSP 和 `<script>` 标签中
- **AND** 内联脚本必须携带对应 nonce 才能执行

---

### Requirement: CSRF 防护

系统 SHALL 对所有状态变更的 POST API 请求进行 CSRF Token 验证。

#### Scenario: 无效 CSRF Token 被拒绝
- **WHEN** 客户端发送 POST 请求到受保护的 API 且未携带有效 CSRF Token
- **THEN** API 返回 403 Forbidden 错误

#### Scenario: 有效 CSRF Token 通过验证
- **WHEN** 客户端发送 POST 请求且携带有效 CSRF Token
- **THEN** 请求正常处理

---

## MODIFIED Requirements

### Requirement: 商品数据源

**之前**: 商品数据硬编码在前端组件（HomeCarousel.tsx 的 FEATURED_PRODUCTS）

**之后**: 商品数据存储在 PostgreSQL 数据库中，通过 Prisma ORM 获取，前端组件从 API 获取数据

---

### Requirement: 支付处理

**之前**: Stripe 支持 Test Mode；PayPal 为 Mock 模式返回模拟 Order ID

**之后**: Stripe 可配置 Test/Live Mode；PayPal Mock 保留但标记为演示模式

---

### Requirement: 首页渲染模式

**之前**: 整个首页标记 `"use client"`，全客户端渲染

**之后**: 首页为 Server Component，数据在服务端获取；交互组件（轮播控制、搜索框等）提取为 Client Component

---

### Requirement: 用户反馈机制

**之前**: 操作结果使用 `alert()` 弹窗提示

**之后**: 使用 shadcn/ui Sonner Toast 组件提供优雅的通知反馈

---

## REMOVED Requirements

无。本 Spec 为纯增量优化，不涉及任何功能移除。
