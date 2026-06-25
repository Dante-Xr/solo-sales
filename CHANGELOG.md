<!--
修改时间：2026-06-05 11:25:22 +08:00
修改内容：新增 v1.5.0 高并发准备能力更新日志，记录依赖故障、交易幂等、缓存、smoke、后台任务和压测基线。
修改模型：gpt-5.5
-->

# SoloSales Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.5.0] - 2026-06-05

### High Concurrency Readiness - Baseline, Reliability, and Operational Gates

#### Dependency Failure Strategy
- **统一依赖故障包装**: 新增 `src/server/services/dependency-guard.ts`，集中处理 Prisma/Neon/Redis 等外部依赖的超时、有限重试、快速失败和标准错误映射。
- **标准 SERVICE_UNAVAILABLE 契约**: 数据库不可达、Redis 异常和请求超时时统一收敛为可观测、可测试的服务不可用响应。
- **关键 API 接入**: `/api/health`、`/api/products`、`/api/products/featured`、后台 dashboard 高频查询路径接入统一依赖策略。
- **健康检查降级**: Redis 不可用时允许健康检查保留主链路可用状态，数据库不可用时明确返回 unhealthy 和 503。

#### Transaction Idempotency and Concurrency Hardening
- **订单幂等键**: `/api/orders` 支持 `Idempotency-Key`，服务层使用用户、幂等键和请求内容生成确定性订单 ID，重复请求可重放既有订单结果。
- **交易域状态边界**: 下单、库存扣减、支付状态迁移、Stripe webhook 重复投递均补充并发和幂等测试。
- **Stripe webhook 幂等约束**: `Payment` 新增 `provider + transactionId` 唯一约束，并新增迁移 `20260604164036_add_payment_provider_transaction_unique`。
- **支付双写事务**: Stripe webhook 中订单状态和支付记录写入纳入事务，唯一约束冲突时按既有支付记录重放成功路径。

#### High Frequency Read Cache and Query Governance
- **前台商品缓存**: 新增 storefront 商品列表缓存 key 和 TTL，`getStorefrontProducts` 支持按筛选条件缓存。
- **Featured/Products 读路径加固**: 商品列表、featured、首页/商品页高频读取路径补齐缓存命中、未命中、缓存失败降级和依赖故障测试。
- **后台 dashboard 缓存**: 后台仪表盘聚合结果支持缓存命中跳过 Prisma，缓存未命中后写回。
- **查询收口**: limit 查询规避不必要精确 `count`，减少高频读路径上的数据库负载。

#### Smoke and Synthetic Contracts
- **新增 smoke/synthetic 脚本**: 新增 `scripts/smoke-synthetic.mjs` 和 `npm run smoke:synthetic`。
- **关键入口覆盖**: 覆盖 `/zh`、`/zh/products`、`/zh/cart`、`/zh/admin/login`、`/api/health`、`/api/csrf-token`、`/api/products`、`/api/products/featured`、Stripe/PayPal 支付负向路径和后台当前用户查询。
- **依赖故障可接受判断**: 标准 `503 SERVICE_UNAVAILABLE` 被识别为已知依赖故障，不误判为页面或契约崩溃。
- **结构化报告**: smoke 输出 JSON，包含成功/失败、依赖故障数、每个检查项的状态、分类和失败原因。

#### Background Job Readiness
- **后台任务模型**: 新增 `BackgroundJob`、`BackgroundJobType`、`BackgroundJobStatus`，并新增迁移 `20260605101144_add_background_jobs`。
- **任务类型定义**: 支持 `WHOLESALER_IMPORT`、`ANALYTICS_REFRESH`、`STRIPE_WEBHOOK_POST_PROCESS`、`NOTIFICATION_DISPATCH` 四类重任务。
- **任务服务与仓储**: 新增 `background-job-service` 和 `background-job-repository`，支持入队、可运行任务查询、运行标记、完成标记、失败重试和死信状态。
- **导入异步入口**: `/api/import` 支持 `execution: "async"`，异步模式返回 202 和 job 信息；默认同步行为保持兼容。
- **资源隔离准备**: 明确导入、分析刷新、webhook 后处理、通知派发的同步/异步边界，避免后台重任务占满前台交易资源。

#### Minimal Load Baseline and Observability
- **新增最小压测脚本**: 新增 `scripts/load-baseline.mjs` 和 `npm run perf:baseline`。
- **非 100k QPS 承诺**: 明确 v1.5 仅建立基线和门禁，10 万级每秒请求只作为长期压力模型，不作为当前真实交付目标。
- **核心指标输出**: 输出 QPS、P95/P99、错误率、503 比例、缓存命中率、DB/Redis 观测耗时、队列堆积观测值。
- **代表性路径覆盖**: 覆盖商品 featured 读、商品列表读、PayPal 支付参数负向写校验。
- **门禁规则**: 非预期 5xx 或异常状态会让基线脚本以非 0 退出，便于 CI 或发布前手动验证。

#### Testing and Verification
- **新增测试套件**:
  - `dependency-guard.test.ts`
  - `health/route.test.ts`
  - `admin/dashboard/route.test.ts`
  - `background-job-service.test.ts`
  - `import/route.test.ts`
  - `smoke-synthetic.test.ts`
  - `load-baseline.test.ts`
- **增强既有测试**:
  - `order-service.test.ts`: 幂等键、重复下单、库存竞争。
  - `payment-service.test.ts`: 重复 webhook、唯一约束冲突重放、支付状态重复写入。
  - `product-service.test.ts`: storefront 缓存、缓存失败降级、limit 查询跳过 count、依赖故障。
  - `inventory-service.test.ts`: 异步导入参数解析和后台任务入队。
- **验证结果**:
  - Prisma validate/generate passed.
  - TypeScript `tsc --noEmit` passed.
  - ESLint passed.
  - Jest passed: 41 suites / 179 tests.
  - Next.js production build passed.

#### Notes
- `.trae/documents` and `.trae/specs` remain ignored by git, so the source-of-truth release documentation for GitHub is this changelog plus `RELEASES.md`.
- `.codex/agents` is local agent configuration and is intentionally not included in this release commit.

## [1.4.0] - 2026-05-02

### Architecture Refactor - Modular Monolith (PLAN2)

#### Architecture Foundation
- **src/server 分层**: 新增 `src/server/services`、`src/server/repositories`、`src/server/contracts` 分层骨架
- **server-only 约束**: 所有服务端 runtime 模块引入 `server-only`，避免 Client Component 误导入
- **统一 API 响应契约**: 成功响应 `{ success: true, data, meta? }`，错误响应 `{ success: false, error: { code, message, details? } }`
- **统一错误模型**: `AppError` 类和 `handleApiError` 统一处理所有 API 异常

#### Service Layer Migration
- **订单支付重构**: 订单创建/查询/金额计算/库存扣减迁移到 `order-service`；Stripe checkout/webhook/支付记录迁移到 `payment-service`
- **商品交易域重构**: 商品/分类/featured/批量操作/优惠券/积分/库存/导入迁移到服务层
- **后台域重构**: 后台用户/角色/权限/管理员资料/RBAC/审计日志迁移到 `admin-service`
- **分析 API 收敛**: `analytics/overview`、`analytics/sales`、`analytics/products`、`analytics/customers`、`analytics/inventory` 完成标准响应收敛

#### Security Enhancements
- **订单金额信任边界**: 服务端按数据库商品价格重新计算订单金额，不再信任客户端传入的价格
- **Stripe webhook 幂等**: 增加签名校验、支付成功处理、重复事件幂等保护
- **库存事务**: 创建订单时在事务内扣减库存

#### Client Adaptations
- **api-client 解包**: 自动解包标准响应格式，兼容新旧错误格式
- **refine-data-provider**: 适配标准响应、分页结构 `{ list, pagination }` 和旧数组响应
- **Google Fonts 移除**: 移除 `next/font/google` 构建期网络依赖，改用系统字体变量

#### Performance & Stability
- **商品查询保护**: Prisma 断连重试和查询超时保护，避免数据库抖动造成页面长时间阻塞
- **兜底商品**: 数据库不可用时首页和商品页展示兜底商品，避免 500 错误

#### Testing
- **新增测试**: order-service、payment-service、product-service、promotion-service、inventory-service、admin-service 全量覆盖
- **测试结果**: 33 suites / 145 tests passed
- **验证通过**: lint、TypeScript、jest、build

## [1.3.0] - 2026-04-27

### Phase 6: UI/UX Enhancement - Mobile-First Optimization

#### 新增组件
- **BottomNav (底部导航栏)**: 移动端固定底部 Tab 导航栏
  - 首页/搜索/购物车/我的 四个导航项
  - 当前页高亮、购物车角标、safe-area 适配
- **HeroBanner (Hero Banner)**: 首页视觉焦点区域
  - 蓝红交织渐变背景
  - 玻璃态浮动统计卡片（评分、销量）
  - CTA 按钮组
- **CategoryNav (分类导航)**: 首页分类快捷入口
  - 6 个默认分类：数码、家居、美妆、服饰、运动、图书
  - 点击跳转搜索页并筛选对应分类
- **StorefrontPageLayout (统一页面布局)**: 店铺统一页面布局组件
  - 移动端：返回按钮 + Logo + 移动端菜单 + 购物车 + 用户
  - 桌面端：完整导航链接 + 视口切换 + 语言切换
  - ViewportWrapper 包裹支持视口模式切换
- **SearchFilterSidebar (搜索筛选侧栏)**: PC 端筛选组件
  - 分类筛选（多选 Checkbox）
  - 价格区间输入（min / max）
  - 评分筛选（星级按钮）
  - 仅显示有货（Checkbox）
  - 重置按钮
- **SwipeToDelete (滑动删除)**: 购物车滑动删除组件
  - 左滑显示删除按钮
  - 支持触摸手势和点击关闭

#### 功能增强
- **购物车固定底部结账栏**: 移动端购物车底部固定显示总价和结账按钮
- **购物车触控区域优化**: 数量调节按钮扩大至 44x44px
- **搜索页 PC 端筛选侧栏**: 左侧固定筛选栏，右侧结果网格
- **商品网格响应式**: 移动端 2 列、平板 3 列、PC 4 列、大屏 5 列

#### 设计系统
- **品牌色彩变量**: 新增 CSS 变量 `--brand`, `--price`, `--success`, `--warning`, `--info`
  - 使用 oklch 色彩系统，WCAG AA 对比度达标
  - 暗色模式对应色彩
- **触控区域优化**: 移动端最小 44x44px 触控区域
- **排版阶梯**: heading-1/2/3, body-lg, caption 等工具类

#### 性能优化
- **ProductCard React.memo**: 商品卡片组件 memo 化，减少不必要的重渲染

## [1.2.0] - 2026-04-26

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
- 1 个默认管理员: [redacted-default-admin-credentials]

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
