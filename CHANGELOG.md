# SoloSales Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.4.0] - 2026-03-24

### 后台管理系统增强

#### 管理员认证系统
- **登录页面**: 新增 `/admin/login` 独立登录页面，简洁现代的设计风格
- **权限管理 (RBAC)**: 完整的权限、角色、用户管理模块
- **数据库迁移**: 从 PostgreSQL 迁移至 Neon (Serverless PostgreSQL)，适配 Netlify 部署

#### 新增页面和功能
- **权限管理**: `/admin/permissions` - 权限的增删改查
- **角色管理**: `/admin/roles` - 角色创建、权限分配
- **用户管理**: `/admin/users` - 管理员用户的增删改查、启用/禁用
- **知识库管理**: `/admin/knowledge` - RAG 知识库管理
- **导入管理**: `/admin/import` - 批发商品导入 (1866 API)
- **客服聊天**: `/admin/chat` - 客服会话界面

#### API 新增
- `POST/GET /api/admin/auth` - 管理员登录/登出/获取当前用户
- `GET/POST/PATCH/DELETE /api/admin/permissions` - 权限 CRUD
- `GET/POST/PATCH/DELETE /api/admin/roles` - 角色 CRUD
- `GET/POST/PATCH/DELETE /api/admin/users` - 用户 CRUD

#### 数据模型更新
- 新增 `Permission` 模型 - 权限定义
- 新增 `Role` 模型 - 角色及权限关联
- 新增 `AdminUser` 模型 - 管理员用户
- 新增 `KnowledgeBase`, `KnowledgeCategory`, `KnowledgeHistory` - 知识库模块
- 新增 `ImportLog` - 导入日志

#### 预置数据
- 30+ 权限项 (dashboard, products, orders, customers, knowledge, users, roles, permissions, settings, import, chat)
- 3 个默认角色 (super_admin, operator, support)
- 1 个默认管理员: admin@solosales.com / Admin@123456

### 基础设施
- **Neon 数据库集成**: Serverless PostgreSQL，支持 Netlify 原生部署
- **netlify.toml 配置**: 优化的构建配置
- **种子数据脚本**: `prisma/seed-admin.ts` 初始化默认数据

### 代码优化
- 所有新功能均添加中文注释
- SearchBox 搜索逻辑优化 (回车键触发)
- 组件性能优化

## [0.2.1] - 2026-03-24

### 性能优化

#### 首屏加载优化
- **WelcomeModal 动态导入**: 使用 `next/dynamic` 实现 WelcomeModal 组件的动态导入，首屏不加载此组件，减少 JS bundle 体积
- **HomeCarousel 定时器优化**: 移除每秒触发的 `useState` 更新，改为纯 `useRef` 计时方式，避免轮播过程中因状态更新导致的频繁重渲染
- **Context 嵌套合并**: 将 ThemeProvider 和 AuthProvider 合并为 CombinedThemeAuthProvider，减少 Provider 嵌套层级从 6 层到 4 层

#### 页面切换优化
- **路由预加载**: 使用 Next.js Link 组件的 `prefetch` 属性对主要导航链接启用预加载，提升页面切换速度
- **React.memo 优化**: 在 Card、Button 等 UI 组件上使用 `React.memo` 包装，减少不必要重渲染
- **CarouselCard 组件**: 为轮播卡片创建独立的 `CarouselCard` 组件并使用 `React.memo` 优化

#### Bundle 优化
- **Bundle Analyzer 配置**: 在 `next.config.ts` 中配置 `@next/bundle-analyzer`，支持通过 `npm run analyze` 分析打包体积

### 代码质量
- 所有性能优化代码均添加中文注释说明
- 代码结构优化，保持可维护性

### 版本更新
- 项目版本从 `0.1.0` 更新至 `0.2.1`
- metadata 版本信息同步更新

## [0.2.0] - 2026-03-24

### 安全增强
- 密码加密存储 (bcrypt)
- 环境变量验证增强
- Rate Limiting 中间件
- API 参数验证 (Zod)
- 安全响应头配置 (CSP, HSTS, X-Frame-Options)

### 性能优化
- 图片 AVIF/WebP 格式自动转换
- `optimizePackageImports` 优化 lucide-react
- Context 缓存优化 (useMemo)

## [0.1.0] - 2026-03-23

### 首次发布
- TikTok 独立站电商基础功能
- 商品展示和搜索
- 购物车和收藏功能
- 结账流程 (Stripe/PayPal)
- 用户认证系统
- 多语言支持 (中/英)
- 暗色模式支持