<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 数据库模型与状态机需求 Spec

## 目的

定义 SoloSales 数据库领域模型、关系、唯一约束、索引、状态机和事务一致性要求。

## Requirement: 核心数据域

系统 SHALL 覆盖用户认证、商品、订单支付、优惠券、积分、RBAC、知识库客服、导入库存、后台任务、联盟、套餐、邮件序列。

### Scenario: 还原 Prisma 模型

- WHEN AI 根据文档复现数据库
- THEN SHALL 还原核心模型、枚举、关系、唯一约束和主要索引
- AND 金额字段 SHALL 使用 Decimal，不得使用 JS float 作为事实金额

## Requirement: 交易一致性

订单、支付、库存、优惠券、积分 SHALL 有明确事务边界和并发失败语义。

### Scenario: 下单扣库存

- WHEN 用户创建订单
- THEN 系统 SHALL 在事务内读取已发布商品、计算总价、校验库存、条件扣减库存、创建订单和订单项
- AND 库存不足 SHALL 返回 `INSUFFICIENT_STOCK`

## 当前差距

- PayPal 当前偏 mock，复现时 SHALL 按真实支付接入要求描述。
- 优惠券核销闭环需要明确创建 `CouponUsage` 和原子递增 `usedCount`。
- 库存预警配置当前 no-op，不得写成已持久化。
- 后台任务需要原子 claim。
- RAG 当前不是向量检索。

