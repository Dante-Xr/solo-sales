<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 前台商城页面需求 Tasks

## Phase 1: Discovery And Boundaries

- 读取 `src/app/[locale]` 页面。
- 读取 `src/components/storefront`、`src/components/product`、`src/stores`、`src/hooks`。
- 确认中英文路由和 `next-intl` 文案来源。

## Phase 2: Implementation Requirements

- 定义首页、商品列表、商品详情、搜索、购物车、订单、个人中心页面状态。
- 定义 loading、empty、error、success 四类 UI。
- 定义移动端导航、响应式网格、SEO 和 i18n 要求。
- 确认结算入口不信任客户端价格。

## Phase 3: Tests And Verification

- 为商品列表、商品详情、首页和购物车补页面测试。
- 覆盖数据库不可达和空商品场景。

## Phase 4: Documentation And Handoff

- 将页面需求映射到 API、service 和组件职责。
- 记录所有兜底策略和不做事项。

