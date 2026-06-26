<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 管理后台与运营模块需求 Checklist

## Documentation Completeness

- [ ] 覆盖 dashboard、商品、订单、客户、导入、知识库、客服、RBAC、设置。

## Functional Correctness

- [ ] 列表支持筛选、分页、排序。
- [ ] 写操作支持成功和失败提示。
- [ ] 批量操作有确认和回滚语义。

## Data And API Contract

- [ ] 后台 API 使用统一响应。
- [ ] Refine data provider 可解包标准响应。

## Security And Permissions

- [ ] 后台页面和 API 有权限要求。
- [ ] 写操作写审计日志。

## Reliability And Failure Modes

- [ ] Dashboard 支持依赖故障降级。
- [ ] 导入失败记录 ImportLog。

## Verification Commands

- [ ] `npm test -- src/app/api/admin/dashboard/__tests__/route.test.ts`
- [ ] `npm run smoke:synthetic`

