<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 前台商城页面需求 Checklist

## Documentation Completeness

- [ ] 覆盖首页、商品列表、商品详情、搜索、购物车、订单、个人中心。
- [ ] 覆盖 `/zh` 和 `/en`。

## Functional Correctness

- [ ] 商品数据来自服务端。
- [ ] 购物车结算只提交商品 ID 和数量。
- [ ] 页面有 loading、empty、error、success 状态。

## Data And API Contract

- [ ] 商品接口使用统一响应契约。
- [ ] 商品价格和库存以数据库为准。

## Security And Permissions

- [ ] 未发布商品不泄露。
- [ ] 个人订单页面只展示本人数据。

## Reliability And Failure Modes

- [ ] 数据库不可达时前台不 500。
- [ ] 商品为空时显示可恢复 UI。

## Verification Commands

- [ ] `npm test -- src/app/[locale]/products/page.test.tsx`
- [ ] `npm run smoke:synthetic`

