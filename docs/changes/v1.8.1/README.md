---
version: v1.8.1
status: planned
github_milestone: https://github.com/Dante-Xr/solo-sales/milestone/1
github_tracking_issue: https://github.com/Dante-Xr/solo-sales/issues/1
---

# v1.8.1 后台、RAG 与客服真实化

版本总追踪：GitHub Issue #1。该计划由原 v1.8.0 顺延。

## 版本目标

让后台订单、商品展示、客服会话、知识库检索和仪表盘反映真实业务状态，清除可购买 mock/fallback 和随机业务指标。

## 范围

- 后台订单展示真实支付、物流和订单状态。
- 客服会话、消息、反馈绑定 owner，知识库管理与公开检索分离。
- 前台商品搜索、首页和列表不展示可购买 mock。
- 移除 dashboard 随机或硬编码业务指标。

## 排除项

- 不把未验证的向量库或注入防护宣传为完整 RAG。
- 不扩大支付或发布范围。

## 依赖与门禁

依赖 v1.8.0 认证恢复完成后的身份边界。发布前应有真实数据证明、权限测试、i18n 回归检查，并将已采纳增量合并回 specs/current.md。
