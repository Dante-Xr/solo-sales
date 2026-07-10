---
version: v1.7.7
status: in_progress
github_milestone: pending
github_tracking_issue: pending
---

# v1.7.7 Figma Enhance 设计系统基础

## 版本目标

将 `figma frontend enhance` 的暖灰背景、深海军蓝主色、酒红强调色、圆角、阴影和基础控件状态迁移到 SoloSales 现有 Next.js 16 前端。

## 范围

- 全局颜色、字体栈、圆角、边框、阴影和移动端触控 token。
- Button、Card、Input 等共享 UI 组件的默认视觉状态。
- 使用现有 `framer-motion` 对齐参考项目的动效能力。

## 排除项

- 不迁移 Vite、React Router、MUI、Radix 或 `motion` 运行时依赖。
- 不改变认证、支付、订单、数据库和 RBAC 行为。

## 候选功能与依赖

当前项目已有依赖可以实现参考代码中的视觉和动效。Google Fonts 不通过网络 CSS 引入，继续使用离线系统字体栈。

## 发布门禁

执行 `npm run docs:check`、测试、lint、type-check、secret audit 和 build，并记录可验证证据。
