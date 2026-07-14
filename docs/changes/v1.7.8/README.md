---
version: v1.7.8
status: planned
github_milestone: pending
github_tracking_issue: 6
---

# v1.7.8 Figma Enhance 用户端迁移

## 版本目标

以最新 `figma frontend enhance` 首页为高保真基准，将其设计系统应用到全部用户端页面，同时保留既有信息架构和业务契约。

## 范围

- Header、Hero、分类筛选、商品网格、收藏、加购、信任横幅、Footer 和移动端底部导航。
- 商品、搜索、购物车、结账、支付、订单、资料、认证和内容页面的共享风格。
- 商品展示数据增加可选分类信息，支持客户端筛选并保持现有 fallback 兼容。

## 排除项

- 不改变用户端路由、i18n、购物车和支付业务契约。
- 不复制参考目录的 Vite 入口或未使用的 UI 依赖集合。

## 候选功能与依赖

使用现有 `framer-motion` 替代 `motion/react`，使用现有 `next/image` 和已配置的远程图片白名单。

## 发布门禁

分类字段转换、分类筛选、空状态、收藏和移动导航测试通过，并完成 `npm run docs:check`、测试、lint、type-check、secret audit 和 build。
