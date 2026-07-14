---
id: HIST-0050
version: v1.6.0
status: historical
archive_reason: historical_import
source_of_truth: .trae (read-only evidence)
---

# v1.6.0 legacy records

## 迁移结论

这是从旧 `.trae` 资料导入的历史变更单元。它不声明当前行为；当前可执行要求以 [current.md](../../../../specs/current.md) 为准。旧计划中的完成标记只能作为线索，未被自动提升为事实。

## 原始范围线索

- 一、当前阶段的统一判断
- 二、本版本修复目标
- 三、本版本包含内容
- 四、本版本不包含内容
- 五、关键风险与依赖
- 六、验收标准
- 七、进入下一版本的前置条件
- 八、结论
- 目录
- 1. 问题合并与优先级重排
- 1.1 P0 - 上线阻断
- 1.2 P1 - 高优先级
- 1.3 P2 - 后续加固
- 2. 核心接口与数据模型调整
- 3. 分阶段实施计划
- Phase 1: 后台 API 鉴权
- Phase 2: 订单隐私
- Phase 3: Mock 和默认账号清理

## 原始来源

- `.trae/documents/2026-06-15_v1.6_上线安全止血与Mock禁用.md`
- `.trae/plans/v1.6-launch-security-hardening-plan.md`

## 采纳与验证

- 验证状态：`unverified`。
- 旧资料中发现 0 个已勾选项和 0 个未勾选项；不据此推断实现状态。
- 当前代码、测试、Prisma schema、提交和 tag 是事实采纳证据；与旧资料冲突时以这些证据为准。
