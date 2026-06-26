<!--
修改时间：2026-06-11 15:47:34 +08:00
修改内容：新增 SoloSales AI 可复现开发需求文档。
修改模型：gpt-5.5
-->

# 项目定位与总体架构 Spec

## 目的

定义 SoloSales 的架构基线：Next.js 16 App Router 上的模块化单体独立站系统。

## Requirement: 架构形态

系统 SHALL 使用模块化单体架构，前台商城、后台管理、API、服务层、仓储层、支付、缓存、数据库和后台任务在同一代码库交付。

### Scenario: 新增功能

- WHEN 新增任意业务功能
- THEN 实现 SHALL 遵循 `页面 -> API route -> service -> repository -> Prisma/PostgreSQL`
- AND 不得默认拆成微服务、独立 BFF 或独立后端项目

## Requirement: 模块边界

系统 SHALL 保持以下边界：`src/app` 放页面和 Route Handlers，`src/server` 放服务端业务，`src/lib` 放通用工具和适配器，`prisma` 放数据模型，`scripts` 放验证脚本。

### Scenario: 编写业务逻辑

- WHEN 业务逻辑涉及订单、支付、库存、权限、缓存或依赖故障
- THEN 逻辑 SHALL 放在 `src/server/services`
- AND Prisma 访问 SHOULD 通过 `src/server/repositories`

## Requirement: API 契约

所有新 API SHALL 使用统一响应：成功为 `{ success: true, data, meta? }`，失败为 `{ success: false, error: { code, message, details? } }`。

