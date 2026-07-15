---
version: v1.7.9
status: in_progress
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

- 未认证桌面端和 390px 移动端已完成本地渲染检查，移动抽屉和暗色切换均已验证。
- 实际仪表盘、列表、知识库及导入/支付凭证页仍需在具备管理员会话与数据库连接的环境中完成验收；该限制不应通过伪造会话绕过。
