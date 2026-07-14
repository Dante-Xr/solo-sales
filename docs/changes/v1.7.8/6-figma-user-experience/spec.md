---
issue: 6
version: v1.7.8
status: completed
---

# #6 Figma Enhance 用户端迁移

## 目标

以 `figma frontend enhance` 的首页为视觉和交互基准，使用现有 Next.js、Tailwind、Base UI、framer-motion 与 Lucide 实现用户端体验，不迁移 Vite 或 `motion/react`。

## 范围

- 首页：半透明头部、红蓝 Hero、信任信息、真实分类胶囊筛选、商品重排、收藏、hover 加购、信任横幅、Footer 和移动底部导航。
- 商品服务：前台商品数据携带可选 `categoryId`、`categoryName`，既有调用及 fallback fixture 保持兼容。
- 用户端页面继承暖灰背景、深海军蓝、酒红强调、12px 圆角、柔和边框和 focus/hover 状态。

## 非目标

- 不改变 API 响应语义、认证、订单、支付、数据库或 RBAC 行为。
- 不主动部署生产环境。

## 验收

- 分类筛选使用真实分类数据，重复点击恢复全部商品，并提供空状态。
- 首页桌面与移动端截图对照参考结构；现有用户端路径保持可访问。
- 运行 docs、lint、类型检查、相关 Jest、密钥审计和构建门禁。
