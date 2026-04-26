# SoloSales Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased] - 2026-04-26

### Phase 4: 管理员功能增强 - 高级组件

#### 新增组件
- **VariantManager (商品变体管理)**: 支持属性组配置、变体组合生成、批量编辑功能
  - 属性组管理：颜色、尺寸、材质等自定义属性组
  - 笛卡尔积算法生成变体组合
  - 批量价格/库存编辑
  - SKU 自动生成
- **InventoryAlert (智能库存预警)**: 基于销量的智能库存预警系统
  - 预警级别计算（紧急/警告/注意/正常）
  - 可售天数预测
  - 建议补货量计算
  - 最后补货时间追踪
- **AuditLog (操作日志)**: 完整的操作审计追踪
  - 多维度筛选（操作类型、操作人、时间范围）
  - 展开式详情查看（修改前后对比）
  - 分页导航

#### 功能增强
- **DataExporter (数据导出)**: 新增 PDF 格式导出支持
  - 集成 jsPDF 和 jsPDF-autotable
  - 横向排版、网格主题
  - 数字列右对齐
- **GlobalSearch (全局搜索)**: 修复 TypeScript 变量引用问题

#### 国际化
- 新增 67 个翻译键（zh.json/en.json）
- 覆盖所有 Phase 4 新增功能

#### 性能优化
- AdminLayout 组件重渲染优化
- Zustand 状态订阅精确化

#### 安全修复
- CSV 导出注入漏洞防护

### Today's Changes

#### UI/UX 优化
- **工具菜单语言切换**: "语言"标题改为"Language/语言"，选项固定为"中文"和"English"（不随语言切换变化）
- **Footer 布局调整**: PC 端"商城"与"公司"列从纵向改为横向排列
- **响应式布局**: 新增移动端独立响应式方案，优化不同屏幕尺寸下的显示效果、间距、字体和触控体验

#### 图标更新
- **Twitter → X**: 更新所有 Twitter 相关图标和链接为 X (x.com)
  - StorefrontFooter 社交图标
  - ShareMenu 分享菜单
  - ProductMeta SEO 组件
- **TikTok Logo**: 替换为官方最新 SVG 图标

#### 视口模式切换 (Viewport Mode)
- **PC 端手机模式**: 在 PC 端浏览器中实现手机端页面模式切换功能
- **强制控制**: 页面布局严格受"切换 PC 端/手机端"按钮控制，不受浏览器窗口大小影响
- **CSS 覆盖层**: 通过 `[data-viewport="mobile"]` 选择器覆盖 Tailwind 响应式断点
- **ViewportWrapper**: 动态修改 viewport meta 标签和添加 data 属性

### 依赖更新
- 移除 lucide-react 的 Twitter 图标，使用自定义 SVG 组件

## [1.0.2] - 2026-04-23

### Bug Fixes

- 修复 `session.user.id` 类型错误
- 修复 TypeScript 类型错误 - session.user.id 和 i18n locale
- 修复语言切换功能

## [1.0.0] - 2026-04-21

### Phase 5: Refine 框架和 Tremor 组件集成

#### 框架升级
- 集成 Refine 框架用于后台管理
- 集成 Tremor 组件库用于数据可视化
- 完成 Phase 5 所有功能模块

## [0.11.0] - 2026-04-18

### Phase 4: next-intl 国际化升级

#### 国际化
- 完成 next-intl 插件配置
- 迁移所有页面到 next-intl 路由
- 实现中英文切换功能

## [0.10.0] - 2026-04-15

### Phase 3: Zustand 状态管理升级

#### 状态管理重构
- Zustand 替代 React Context
- 优化状态管理性能
- 减少不必要的重渲染

## [0.9.0] - 2026-04-14

### Phase 1 & 2: 零成本修复和安全增强

#### 安全修复
- 安全响应头配置
- CSP, HSTS, X-Frame-Options 配置
- Rate Limiting 中间件

#### 性能优化
- 首屏加载优化
- WelcomeModal 动态导入
- HomeCarousel 定时器优化
- Context 嵌套合并

#### 新增功能
- next-themes 主题管理
- TanStack Query 数据获取
- ViewportModeToggle 手机端模式切换
- ViewportWrapper 视口容器

### Bug Fixes
- 修复 safeErrorLog 参数顺序错误
- 修复多币种/营销/分销 API 导入问题
- 修复缓存函数问题

## [0.8.1] - 2026-04-13

### Bug Fixes
- 修复首页点击功能 (Hydration mismatch修复)

## [0.8.0] - 2026-04-13

### 首页 PC 重构: Shopify Style

#### 布局重构
- Shopify 风格首页设计
- 极简现代美学布局
- PC 端响应式优化

## [0.6.2] - 2026-04-12

### 管理员功能增强
- 管理员个人资料菜单功能
- ESLint 代码规范清理

## [0.6.0] - 2026-04-11

### M4 智能运营模块

#### 新增功能
- 数据分析仪表盘
- 订单管理增强
- 客户管理模块
- 营销工具集成
- 分销系统

#### API 新增
- 营销活动管理 API
- 分销商管理 API
- 数据分析 API

## [0.5.9] - 2026-04-10

### 安全修复与性能优化
- API 安全增强
- 性能监控优化
- 缓存策略优化

## [0.5.7] - 2026-04-09

### M5.3 移动端表单 Sheet + M6 触控优化

#### 移动端优化
- 移动端表单 Sheet 组件
- 触控区域 44px 最小尺寸
- 列表项触控反馈优化
- iPhone 安全区域支持

## [0.5.6] - 2026-04-08

### Bug Fixes
- 修复夜间模式按钮问题
- 修复登录重定向问题
- Next.js 16 proxy 迁移适配

## [0.5.0] - 2026-04-07

### 移动端增强

#### M5 移动端优化
- 移动端表单优化
- 触控交互增强
- 性能优化

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
