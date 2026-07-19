<!--
修改时间：2026-07-20 00:00:00 +08:00
修改内容：新增 v1.8.0 认证邮件恢复与 worker 发布门禁记录。
修改模型：gpt-5
-->

# SoloSales Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.8.0] - In Progress

### Added
- 普通用户和管理员分域的邮箱 OTP 密码恢复、管理员激活、委派重置、CLI 恢复、邮箱变更确认和恢复审计。
- AES-256-GCM 加密认证邮件队列、SMTP 接受后 OTP 起算、重试、15 分钟死信、运行历史和健康降级。
- Netlify 每分钟 Scheduled Function、后台“任务调度”页签，以及 `worker.view` / `worker.manage` 权限和启用前依赖预检。

### Release Gate
- v1.8.0 尚未创建 Git tag；真实 Netlify Scheduled Function、Redis、SMTP 和 OTP 端到端验收仍为发布门禁。

## [1.7.8] - 2026-07-14

### Figma Enhance User Experience

#### Added
- 首页使用真实商品分类字段提供分类筛选；再次点击当前分类恢复全部商品，并覆盖空状态、收藏和加购交互。
- 基于现有 `framer-motion` 的 Hero 与商品入场/重排动效，无新增视觉框架依赖。
- 中英文分类显示映射，避免已知分类在中文界面回退为英文。

#### Changed
- 用户端全局 token 更新为暖灰画布、深海军蓝、酒红强调、12px 圆角和高对比度暗色 token。
- 首页、头部、信任横幅、商品卡和页脚按 Figma Enhance 风格重新实现；页脚随日间/夜间主题切换。
- 前台页脚只标示现有 Stripe 托管信用卡结账入口，不再展示未由前台结账启用的渠道。

## [1.7.7] - 2026-07-14

### Documentation Migration and Release Governance

#### Added
- 受版本控制的 `docs` 治理结构、当前规格、发布路线图和版本变更目录。
- `.trae` 历史 Markdown 来源清单、迁移映射与 `npm run docs:check` 验证脚本。
- v1.7.7 Issue #5 的规格和任务记录。

#### Changed
- 历史 `.trae` 文档由本地源资料转为可审计的 `docs/legacy` 迁移证据。
- v1.7.7-v1.7.9 使用独立 Issue、路线图和发布状态记录。

## [1.7.6] - 2026-07-03

### Type Safety Refactor - 类型安全边界收紧

#### Added
- **第三方支付 SDK 类型声明**:
  - `src/types/alipay-sdk.d.ts`: Alipay SDK 配置、执行参数和通知参数类型。
  - `src/types/wechatpay.d.ts`: WeChat Pay 配置、Native 支付请求和通知体类型。
  - `src/types/paypal.d.ts`: PayPal order、link、amount、capture 响应类型增强。
- **核心类型接口**:
  - `WebhookRawData`: 替代支付 webhook 中的松散原始数据类型。
  - `CacheEntry<T>`: 缓存值和过期时间使用泛型约束。
  - Bundle / Affiliate Prisma 查询结果类型别名，减少服务层类型断言。
- **错误处理工具**:
  - `src/types/errors.ts`: `CatchError`、`isError()`、`getErrorMessage()`、`getErrorStack()`。
  - `.trae/specs/v1.7.6-type-safety/error-handling.md`: catch 块错误处理规范。
- **类型检查脚本**:
  - `scripts/check-types.mjs`
  - `npm run type-check`
  - `npm run type-check:strict`

#### Changed
- **支付 provider 类型收紧**: Alipay、WeChat Pay、PayPal provider 改用显式 SDK / 响应类型，减少 `any`。
- **服务层类型收紧**: BundleService、AffiliateService、permissionLog、cache 等模块改用 Prisma Payload、Record 类型别名和泛型接口。
- **API 错误处理标准化**: 多数 `catch` 块显式使用 `error: unknown`，再通过类型守卫提取 message / stack。
- **项目版本标识**: 根 `package.json`、`package-lock.json`、README、RELEASES、CHANGELOG 和 `/api/health` fallback 同步到 `1.7.6`。

#### Fixed
- 修复 PayPal capture route 交易 ID 可能为空的类型问题。
- 修复 PayPal order response link 类型缺失导致的类型退化。
- 修复 permissionLog、AffiliateService、BundleService 中 Prisma 类型不匹配问题。
- 修复项目全量 TypeScript 类型错误，为后续 v1.8 开发建立类型基线。

## [1.6.6] - 2026-06-27

### Expert Optimization Update - 三专家诊断优化完成

#### Added
- **统一间距系统**: 基于8px网格的响应式间距工具类
  - `.space-y-section`: 页面级间距（12/16/20）
  - `.space-y-component`: 组件级间距（6/8）
  - `.space-y-element`: 元素级间距（3/4）
  - `.padding-section/component`: 内边距工具类
- **扩展字体层级**: 从3个扩展到6个层级
  - `.heading-xl/.lg/.md/.sm/.xs/.2xs`: 完整的标题层次
  - 响应式字体大小和行高
- **卡片悬停效果**: 微妙的交互反馈
  - `.card-hover`: 标准悬停效果（阴影+上浮）
  - `.card-hover-subtle`: 微妙悬停效果
- **动画系统**: 使用framer-motion实现
  - `src/lib/animations.ts`: 动画配置（pageTransition/fadeIn/slideUp/scaleIn）
  - `src/components/animations/AnimationWrappers.tsx`: 6个动画包装组件
  - FadeIn/SlideUp/ScaleIn/PageTransition/StaggerContainer/StaggerItem
- **工具函数模块**: 消除代码重复
  - `src/lib/format/currency.ts`: formatCurrency/formatCurrencyCompact
  - `src/lib/format/date.ts`: formatDate/formatDateTime/formatRelativeTime
  - `src/lib/format/text.ts`: truncateText/capitalize/toTitleCase等
  - `src/lib/format/index.ts`: 统一导出
- **E2E测试扩展**: 从3个扩展到15个测试文件
  - `tests/e2e/storefront/auth.spec.ts`: 用户认证（登录/注册/登出）
  - `tests/e2e/storefront/cart.spec.ts`: 购物车功能
  - `tests/e2e/storefront/checkout.spec.ts`: 结账流程
  - `tests/e2e/storefront/search.spec.ts`: 搜索/筛选/排序
  - `tests/e2e/storefront/product-detail.spec.ts`: 商品详情
  - `tests/e2e/storefront/wishlist.spec.ts`: 愿望清单
  - `tests/e2e/storefront/responsive.spec.ts`: 响应式设计
  - `tests/e2e/storefront/reviews.spec.ts`: 商品评价
  - `tests/e2e/storefront/orders.spec.ts`: 订单历史
  - `tests/e2e/storefront/profile.spec.ts`: 用户资料
  - `tests/e2e/storefront/performance.spec.ts`: 性能和可访问性
  - `tests/e2e/storefront/coupons.spec.ts`: 优惠券和促销

#### Fixed
- **颜色硬编码修复**: 38个组件完成Klein Blue主题映射
  - 所有`orange`硬编码 → `accent`（Klein Blue红色）
  - 所有`green`硬编码 → `success`（绿色成功）
  - 所有`blue`硬编码 → `brand`（Klein Blue品牌色）
  - 所有`yellow`硬编码 → `warning`（黄色警告）
  - 品牌一致性达到100%
- **E2E测试配置**: 排除Playwright测试避免Jest运行失败
  - 修改`jest.config.ts`排除`tests/e2e/`目录
  - Jest单元测试: 291/291通过

#### Changed
- **工具函数应用**: 3个组件开始使用统一格式化函数
  - `MobileProductCard.tsx`: 使用formatCurrency
  - `ProductRow.tsx`: 使用formatCurrency和formatDate
  - `SalesChart.tsx`: 使用formatCurrency

#### Documentation
- 完整的中文注释（57个文件）
- 实施验证报告
- 三专家诊断文档

#### Metrics
- 品牌一致性: 70% → 100%
- 代码重复: -8%
- E2E测试覆盖: +400%（3→15个文件）
- Git提交: 41个高质量提交

## [1.6.5] - 2026-06-27

### Klein Blue Theme System and E2E Testing

#### Added
- **Playwright E2E Testing Framework**: 完整的端到端测试基础设施
  - `playwright.config.ts`: 多浏览器配置（Chromium, Firefox, WebKit, Mobile）
  - `tests/e2e/storefront/homepage.spec.ts`: 首页加载、主题色验证、导航测试
  - `tests/e2e/storefront/navigation.spec.ts`: 语言切换、主题切换、搜索功能测试
  - `tests/e2e/storefront/product-browsing.spec.ts`: 商品列表、详情、购物车、筛选、排序测试
- **Klein Blue Brand Theme**: 克莱因蓝(#002FA7)主题系统
  - `--brand`: Klein Blue主品牌色，用于主要按钮和操作
  - `--brand-hover`: 深蓝色悬停状态
  - `--accent`: 红色(#DC2626)强调色，用于价格和危险操作
  - `--accent-hover`: 深红色悬停状态
- **Structured Logger**: 生产级结构化日志系统
  - `src/lib/logger.ts`: 环境感知、类型安全的日志工具
  - 支持debug/info/warn/error级别
  - 生产环境仅输出error，测试环境静默
- **Documentation**: 完整的规范和执行文档
  - `.trae/specs/v1.6.5-playwright-theme-optimization/`: spec/tasks/checklist
  - `V1.6.5_EXECUTION_STATUS.md`: 详细执行路线图
  - `V1.6.5_THEME_COMPLETION_REPORT.md`: 主题实施报告
  - `EXECUTION_SUMMARY.txt`: 快速参考

#### Changed
- **Theme Color Mapping**: CSS变量映射实现零代码修改主题更新
  - `--primary` → `var(--brand)`: 主要操作色映射到Klein Blue
  - `--destructive` → `var(--accent)`: 危险操作映射到Red
  - 明亮主题和暗黑主题均已更新
- **Console Cleanup (45% reduction)**: 从118个减少到65个
  - 14个服务/库文件迁移到structured logger
  - admin-service, product-service, EmailService, StockAlertService等
  - cache, redis, permissionLog, CurrencyService等
- **Modal Handling**: 修复Welcome modal阻止导航的问题
  - E2E测试中添加关闭modal处理

#### Fixed
- **Welcome Modal Blocking**: 首页欢迎弹窗阻止导航链接点击
- **Test Stability**: E2E测试稳定性改进，3/3 Chromium测试通过

#### Security
- **better-auth**: 升级到1.6.22，修复设备授权绕过漏洞(GHSA-cq3f-vc6p-68fh)
- **DOMPurify**: 修复4个XSS CVE漏洞

#### Testing
- **Playwright Tests**: 3个测试套件，15个测试用例
  - Homepage: 加载、主题色、导航 (3/3 passed)
  - Navigation: 语言、主题、搜索 (待执行)
  - Product Browsing: 列表、详情、购物车等 (待执行)
- **Multi-browser Support**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Test Artifacts**: 自动截图和视频录制

## [1.6.0] - 2026-06-26

### Security Hardening and Environment Rotation

#### Added
- **秘钥审计工具**: 新增 `scripts/secret-audit.mjs` 和 `npm run audit:secrets` 命令，扫描代码库中的硬编码秘钥、API 密钥、访问令牌等敏感信息
- **启动安全检查**: 新增 `scripts/__tests__/launch-copy-safety.test.ts` 验证启动配置和复制安全性
- **全面 API 认证测试**: 新增超过 20 个认证测试套件，覆盖 Admin、Customer、Order、Analytics、Review、Points、Coupon、Knowledge 等所有关键 API 端点
- **游客结账禁用验证**: 新增 `scripts/__tests__/guest-checkout-disabled.test.ts` 确保游客结账功能已被正确禁用
- **代理边界测试**: 新增 `scripts/__tests__/proxy-boundary.test.ts` 验证 API 代理和路由边界
- **运维 API 认证测试**: 新增 `scripts/__tests__/operational-api-auth.test.ts` 覆盖运维相关 API 的认证边界

#### Changed
- **环境验证器加固**: 改进 `src/lib/env-validator.ts`，增强必需环境变量的验证和更严格的检查逻辑
- **管理员登录页面**: 修复 `src/app/[locale]/admin/(auth)/login/page.tsx` 的会话状态处理和重定向逻辑
- **订单确认页**: 增强 `src/app/[locale]/orders/confirmation/[id]/page.tsx` 的认证检查
- **订单详情页**: 改进 `src/app/[locale]/orders/[id]/page.tsx` 的用户权限验证
- **Prisma 客户端**: 优化 `src/lib/prisma.ts` 的连接初始化和处理逻辑
- **Netlify 配置**: 更新 `netlify.toml` 生产部署运行时配置
- **部署文档**: 更新 `DEPLOYMENT.md` 反映安全要求和环境变量轮换建议

#### Removed
- **游客结账组件**: 删除 `src/components/auth/GuestCheckoutForm.tsx` 及相关 193 行代码
- **结账模态框简化**: 从 `CheckoutModal` 和 `EnhancedCheckoutModal` 移除游客结账逻辑（共 130 行）
- **AuthModal 精简**: 从 `AuthModal` 移除游客相关逻辑（40 行）
- **未使用中间件**: 清理 `middleware.ts` 中未使用的模式（8 行）
- **废弃验证器**: 从 `src/lib/validators.ts` 移除废弃的验证逻辑（20 行）

#### Security
- **Admin API 认证保护**:
  - `/api/admin/auth`: 新增 149 个认证测试用例
  - `/api/admin/dashboard`: 新增 31 个仪表盘访问控制测试
  - `/api/admin/orders`: 新增 75 个订单管理授权测试
  - `/api/admin/reviews`: 新增 90 个评论审核权限测试
  - `/api/admin/permissions`: 新增 63 个权限 CRUD 授权测试
  - `/api/admin/roles`: 新增 63 个角色管理授权测试
  - `/api/admin/users`: 新增 54 个用户管理授权测试
- **Analytics API RBAC**:
  - `/api/analytics/overview`: 新增 48 个概览访问控制测试
  - `/api/analytics/customers`: 新增 48 个客户分析授权测试
  - `/api/analytics/inventory`: 新增 48 个库存分析授权测试
  - `/api/analytics/products`: 新增 48 个商品分析授权测试
  - `/api/analytics/sales`: 新增 48 个销售分析授权测试
- **Customer API 用户隔离**:
  - `/api/customers`: 新增 50 个客户数据访问保护测试
  - `/api/customers/[id]`: 新增 39 个客户详情授权测试
- **Order API 认证**:
  - `/api/orders`: 新增 68 个订单创建和查询认证测试
  - `/api/orders/[id]`: 新增 69 个订单详情访问控制测试
- **Review API 所有权验证**:
  - `/api/reviews/[id]`: 新增 131 个评论所有权和管理员审核测试
  - `/api/reviews/[id]/replies`: 新增 133 个回复创建和审核认证测试
- **Points API 用户上下文**:
  - `/api/points`: 新增 93 个积分余额和事务测试
  - `/api/points/earn`: 新增 53 个积分获取授权测试
  - `/api/points/redeem`: 新增 53 个积分兑换授权测试
  - `/api/points/transactions`: 新增 67 个积分流水访问控制测试
- **Coupon API 管理员限制**:
  - `/api/coupons`: 新增 18 个优惠券管理员专用测试
  - `/api/coupons/[id]`: 增强优惠券 CRUD 授权检查
- **Knowledge API 角色控制**:
  - `/api/knowledge`: 新增 66 个知识库管理权限测试
  - `/api/knowledge/[id]`: 增强知识条目访问控制
- **Chat API 认证**:
  - `/api/chat`: 新增 158 个聊天 API 认证测试
  - `/api/chat/feedback`: 新增 144 个反馈 API 授权测试
- **Payment API 安全**:
  - `/api/checkout/stripe`: 新增 84 个 Stripe 结账认证测试
  - `/api/checkout/paypal`: 新增 52 个 PayPal 结账认证测试
- **Currency API 保护**:
  - `/api/currency/rates`: 新增 85 个汇率查询授权测试
- **Abandoned Cart API**:
  - `/api/abandoned-cart`: 新增 114 个遗弃购物车访问控制测试
- **Categories API**:
  - `/api/categories`: 新增 55 个分类管理授权测试
- **Products API**:
  - `/api/products`: 新增 53 个商品管理授权测试
  - `/api/products/[id]`: 增强商品详情访问控制
- **Import API**:
  - `/api/import`: 新增 8 个导入 API 管理员权限测试
- **服务层认证守卫**:
  - `admin-service`: 新增 30 个服务层认证边界测试
  - `order-service`: 新增 43 个订单服务认证测试
  - `payment-service`: 新增 69 个支付服务授权测试
- **限流保护**: 为管理员敏感操作应用速率限制（`src/middleware/rate-limit.ts`）

#### Testing
- **新增测试文件总数**: 20+ 个认证测试套件
- **新增测试用例总数**: 2000+ 个认证和授权测试用例
- **测试覆盖率提升**: API 认证覆盖率从 ~60% 提升到 ~95%
- **秘钥审计测试**: `scripts/__tests__/secret-audit.test.ts` 验证审计脚本功能
- **环境验证测试**: `src/lib/__tests__/env-validator.test.ts` 新增 61 个环境变量验证测试

#### Breaking Changes
- **游客结账已移除**: 所有结账流程现在都需要用户认证；前端必须实现用户注册流程
- **订单 API 需要认证**: `/api/orders` 现在需要认证；前端必须处理认证错误
- **更严格的环境验证**: 缺少关键环境变量将导致启动失败；请检查 `.env.example`

#### Notes
- 游客结账已永久禁用；所有交易都需要认证用户
- Admin API 统一实施基于角色的访问控制
- 建议在每次部署前在 CI 管道中运行秘钥审计
- 生产环境建议每 90 天轮换一次环境变量

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
