---
id: HIST-0056
version: v1.2.0
status: historical
archive_reason: historical_import
source_of_truth: .trae (read-only evidence)
---

# v1.2.0 legacy records

## 迁移结论

这是从旧 `.trae` 资料导入的历史变更单元。它不声明当前行为；当前可执行要求以 [current.md](../../../../specs/current.md) 为准。旧计划中的完成标记只能作为线索，未被自动提升为事实。

## 原始范围线索

- 版本信息
- 目标概述
- 功能清单
- 1. 行内编辑模式 (Inline Editing)
- 2. 一键上下架开关 (Quick Toggle)
- 3. 批量折扣工具 (Batch Discount)
- 4. 库存快速调整 (Quick Stock Adjust)
- 组件结构
- API 变更
- 新增接口
- 数据库变更
- 依赖项
- 1. 自定义日期范围 (Custom Date Range)
- 2. 指标自选 (Metric Selector)
- 3. 图表类型切换 (Chart Type Toggle)
- 4. 同比/环比对比 (Compare Periods)
- 5. 新增图表类型
- 数据库查询优化

## 原始来源

- `.trae/plans/v1.2-admin-optimization-phase1.md`
- `.trae/plans/v1.2-admin-optimization-phase2.md`
- `.trae/plans/v1.2-admin-optimization-phase3.md`
- `.trae/plans/v1.2-admin-optimization-phase4.md`

## 采纳与验证

- 验证状态：`unverified`。
- 旧资料中发现 0 个已勾选项和 156 个未勾选项；不据此推断实现状态。
- 当前代码、测试、Prisma schema、提交和 tag 是事实采纳证据；与旧资料冲突时以这些证据为准。
