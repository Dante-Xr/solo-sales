---
version: v1.7.9
status: released
github_milestone: pending
github_tracking_issue: 7
---

# v1.7.9 Figma Enhance 全站收口

## 版本目标

将 Figma Enhance 视觉系统统一应用到管理后台和所有共享页面容器，完成全站响应式与主题状态收口。

## 范围

- 后台侧边栏、顶栏、面包屑、标签页、表格、筛选、表单、图表、弹窗和空状态。
- 全站颜色、排版、间距、圆角、focus、hover、dark mode、安全区和触控区域检查。
- 最终版本标识、发布路线图、manifest 和当前规格证据同步。

## 排除项

- 不改变后台认证、RBAC、搜索、分页、导入和数据操作行为。
- 不新增参考项目未被实际页面使用的框架依赖。

## 候选功能与依赖

继续使用当前 Next.js 16、React 19、Tailwind 4、Base UI、Lucide 和 `framer-motion`。

## 发布门禁

完成桌面端和移动端浏览器截图验收，并通过 `npm run docs:check`、完整测试、lint、type-check、secret audit 和 build。

## 当前验证边界

- 2026-07-16 已使用数据库中的真实 `super_admin` 会话完成仪表盘、商品、订单、知识库、导入和支付凭证页验收，未伪造 Cookie 或绕过认证。
- 桌面端与 390x844 移动端已完成浏览器检查，移动导航、暗色切换和主题刷新均无业务控制台错误。
- 完整测试、lint、严格类型检查、文档校验、密钥审计、Prisma 生成和生产构建已通过；依赖审计无高危，保留 4 个中危上游传递依赖告警。
- 版本号已同步为 `1.7.9`，版本以 `v1.7.9` Git tag 发布；未主动触发生产部署。
