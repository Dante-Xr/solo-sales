<!--
修改时间：2026-06-05 11:25:22 +08:00
修改内容：新增 v1.5.0 发布说明，汇总高并发准备能力、后台任务、smoke/synthetic 和压测基线。
修改模型：gpt-5.5
-->

# SoloSales Release Notes

Comprehensive version history documenting all functional modules and features from version 1.0 to current release.

---

## Release Timeline

| Version | Release Date | Status |
|---------|-------------|--------|
| [1.5.0](#v150---2026-06-05) | 2026-06-05 | Latest |
| [1.4.0](#v140---2026-05-02) | 2026-05-02 | Stable |
| [1.3.0](#v130---2026-04-27) | 2026-04-27 | Stable |
| [1.2.0](#v120---2026-04-26) | 2026-04-26 | Stable |
| [1.0.2](#v102---2026-04-23) | 2026-04-23 | Stable |
| [1.0.0](#v100---2026-04-21) | 2026-04-21 | Stable |

---

## v1.5.0 - 2026-06-05

### High Concurrency Readiness - Reliability and Operational Baseline

v1.5.0 does not claim production readiness for 100k requests per second. It establishes the engineering foundation required before any serious capacity claim: dependency failure contracts, transaction idempotency, read-path caching, smoke/synthetic checks, background job readiness, and a repeatable lightweight load baseline.

#### Reliability and Dependency Strategy

| Module | Feature | Description |
|--------|---------|-------------|
| dependency-guard | Dependency Wrapper | Central timeout, retry, fast-fail, and error mapping for external dependencies |
| Health API | Degraded Checks | Database failures return unhealthy 503; Redis failures are reported without breaking the main health path |
| Products API | Failure Contract | Products and featured products return standard `SERVICE_UNAVAILABLE` when external database dependency fails |
| Admin Dashboard | Guarded Aggregation | Dashboard high-frequency aggregation path is protected by dependency guard and cache behavior |

#### Transaction and Payment Hardening

| Module | Feature | Description |
|--------|---------|-------------|
| Orders | Idempotency-Key | Order creation supports deterministic replay for duplicate client requests |
| Inventory | Concurrency Tests | Stock deduction boundary covered by negative and concurrency tests |
| Payment | Unique Provider Transaction | `Payment(provider, transactionId)` unique constraint prevents duplicate webhook payment writes |
| Stripe Webhook | Transactional Processing | Order/payment updates are handled inside a transaction with duplicate replay behavior |

#### Read Path Governance

| Module | Feature | Description |
|--------|---------|-------------|
| Storefront Products | Cache Key | Filter-aware storefront products cache key and TTL |
| Product List | Count Avoidance | Limit-based queries avoid unnecessary exact count where possible |
| Featured Products | Cached Reads | Featured path covered by cache hit, miss, and failure fallback tests |
| Admin Dashboard | Cache Contract | Cache hit skips Prisma aggregation, cache miss writes dashboard result back |

#### Smoke, Synthetic, and Load Baseline Tooling

| Command | Purpose | Output |
|---------|---------|--------|
| `npm run smoke:synthetic` | Validates key pages, APIs, negative payment paths, and dependency-failure contracts | Structured JSON smoke report |
| `npm run perf:baseline` | Runs a small repeatable baseline over representative read/write paths | QPS, P95/P99, error rate, 503 rate, cache hit rate, dependency and queue observations |

#### Smoke/Synthetic Coverage

| Area | Paths |
|------|-------|
| Storefront Pages | `/zh`, `/zh/products`, `/zh/cart` |
| Admin Page | `/zh/admin/login` |
| Core APIs | `/api/health`, `/api/csrf-token`, `/api/products`, `/api/products/featured` |
| Negative Paths | Stripe invalid request, PayPal invalid request, admin current-user unauthorized query |

#### Background Job Readiness

| Module | Feature | Description |
|--------|---------|-------------|
| Prisma | BackgroundJob Model | Adds generic background job table with status, retry, payload, lock, and dead-letter fields |
| Background Job Service | Queue Preparation | Enqueue, runnable query, running/completed/failed updates, exponential backoff |
| Import API | Async Mode | `execution: "async"` returns 202 and a job id, while default sync mode remains compatible |
| Task Boundaries | Resource Isolation | Import, analytics refresh, webhook post-processing, and notification dispatch boundaries documented in code |

#### Database Migrations

| Migration | Description |
|-----------|-------------|
| `20260604164036_add_payment_provider_transaction_unique` | Adds unique constraint for payment provider transaction idempotency |
| `20260605101144_add_background_jobs` | Adds background job type/status enums and `BackgroundJob` table |

#### Test Coverage

| Suite | Coverage |
|-------|----------|
| dependency-guard.test.ts | Timeout, retry, Redis/database dependency mapping |
| health route tests | Database unavailable and Redis degraded contracts |
| product-service.test.ts | Storefront cache, retry behavior, cache failure degradation, count avoidance |
| order-service.test.ts | Order idempotency and stock concurrency boundaries |
| payment-service.test.ts | Webhook duplicate replay and transaction idempotency |
| background-job-service.test.ts | Job definitions, enqueue, retry, dead-letter handling |
| import route tests | Async import returns 202; sync import remains compatible |
| smoke-synthetic.test.ts | Synthetic dependency failures and required page failures |
| load-baseline.test.ts | Metrics output and baseline gate failure behavior |

#### Verified Commands

- `node .\node_modules\prisma\build\index.js validate` - Passed
- `node .\node_modules\prisma\build\index.js generate` - Passed
- `node .\node_modules\typescript\bin\tsc --noEmit` - Passed
- `node .\node_modules\eslint\bin\eslint.js ...` - Passed
- `node .\node_modules\jest\bin\jest.js --runInBand` - Passed: 41 suites / 179 tests
- `node .\node_modules\next\dist\bin\next build` - Passed

#### Known Operational Notes

- v1.5.0 does not introduce microservices, CQRS, or a full event bus.
- v1.5.0 does not claim 100k QPS production capacity.
- Neon/database unavailability is treated as an explicit dependency failure contract rather than a page crash.
- `.codex/agents` remains local configuration and is not part of the release artifact.

---

## v1.4.0 - 2026-05-02

### PLAN2 Modular Monolith Refactor - Server Architecture

#### Architecture Foundation

| Module | Feature | Description |
|--------|---------|-------------|
| src/server | Service Layer | New `src/server/services` for business logic separation |
| src/server | Repository Layer | New `src/server/repositories` for Prisma query encapsulation |
| src/server | Contracts | Unified API response, error codes, HTTP status mapping, AppError |
| src/server | Auth | Server-side session and authentication helpers |
| src/server | Payments | Stripe SDK encapsulation and payment capabilities |
| server-only | Import Constraint | All server runtime modules import `server-only` |

#### API Response Standardization

| Module | Feature | Description |
|--------|---------|-------------|
| Success Response | Standard Format | `{ success: true, data, meta? }` |
| Error Response | Standard Format | `{ success: false, error: { code, message, details? } }` |
| successResponse | Extended | Supports status, headers, fromCache, meta, and top-level compatibility |
| handleApiError | Unified | Handles AppError and unknown exceptions consistently |

#### Order & Payment Security

| Module | Feature | Description |
|--------|---------|-------------|
| Order Amount | Trust Boundary | Server recalculates order amount from database product prices |
| Inventory | Transaction | Inventory deduction in transaction during order creation |
| Stripe Checkout | Line Items | Uses database prices to generate Stripe line items |
| Stripe Webhook | Security | Signature verification, payment success handling, idempotency protection |

#### Service Migration

| Domain | Services |
|--------|----------|
| Order | Order creation, query, amount calculation, inventory deduction |
| Payment | Stripe checkout, webhook validation, payment record updates |
| Product | List, detail, CRUD, featured, batch operations |
| Promotion | Coupon CRUD/validation, points account/query/redeem |
| Inventory | Wholesale import, mapping, SKU deduplication, alerts |
| Admin | Users, roles, permissions, profile, RBAC, audit logs |

#### Frontend Adaptations

| Module | Feature | Description |
|--------|---------|-------------|
| api-client | Auto Unwrap | Automatically unwraps standard response format |
| refine-data-provider | Adapter | Adapts to standard response, pagination, and legacy array format |
| refine-auth-provider | Error Compatible | Structured login error compatibility |
| PayPal/PayPal Checkout | Response Compatible | Standard response compatibility |
| Google Fonts | Removed | Build-time network dependency removed, system font variables |

#### Test Coverage

| Suite | Tests | Coverage |
|-------|-------|----------|
| order-service.test.ts | Order amount trust boundary, inventory shortage, transaction | 100% |
| payment-service.test.ts | Stripe checkout, webhook, idempotency | 100% |
| product-service.test.ts | Product query, SKU conflict, category protection, retry | 100% |
| promotion-service.test.ts | Coupon cap, usage limit, points balance | 100% |
| inventory-service.test.ts | Import progress, failure stats, alerts | 100% |
| admin-service.test.ts | Admin uniqueness, role protection, pagination | 100% |
| api-client.test.ts | Response unwrap, error handling | 100% |
| refine-data-provider.test.ts | List unwrap, legacy compatibility, custom query | 100% |

**Test Results:** 33 suites / 145 tests passed

#### Verified Commands

- `npm run lint` - Passed
- `npx tsc --noEmit` - Passed
- `npm test -- --runInBand` - Passed
- `npm run build` - Passed

---

## v1.3.0 - 2026-04-27

### Phase 6: UI/UX Enhancement - Mobile-First Optimization

#### New Components

| Module | Feature | Description |
|--------|---------|-------------|
| BottomNav | 底部导航栏 | 移动端固定底部 Tab 导航（首页/搜索/购物车/我的） |
| HeroBanner | Hero Banner | 首页视觉焦点区域，蓝红渐变背景、浮动统计卡片 |
| CategoryNav | 分类导航 | 首页分类快捷入口（数码/家居/美妆/服饰/运动/图书） |
| StorefrontPageLayout | 统一页面布局 | 移动端和桌面端统一的 Header、内容容器、装饰背景 |
| SearchFilterSidebar | 搜索筛选侧栏 | PC 端固定侧栏，支持分类/价格/评分/库存筛选 |
| SwipeToDelete | 滑动删除 | 购物车商品左滑显示删除按钮 |

#### Feature Enhancements

| Module | Feature | Description |
|--------|---------|-------------|
| Cart | 固定底部结账栏 | 移动端购物车底部固定显示总价和结账按钮 |
| Cart | 触控区域优化 | 数量调节按钮扩大至 44x44px |
| Cart | 优惠券输入 | CouponInput 组件，支持折扣码应用 |
| Cart | Upsell 推荐 | 结账前推荐相关商品 |
| Search | PC 端筛选侧栏 | 左侧固定筛选栏，右侧结果网格 |
| ProductGrid | 响应式网格 | 移动端 2 列、平板 3 列、PC 4 列、大屏 5 列 |

#### Design System

| Module | Change | Description |
|--------|--------|-------------|
| CSS Variables | 品牌色彩 | 新增 `--brand`, `--price`, `--success`, `--warning`, `--info` |
| Touch Optimization | 触控区域 | 移动端最小 44x44px 触控区域 |
| Color Token | 价格色 | oklch 色彩系统，WCAG AA 对比度达标 |

#### Performance Optimization

| Module | Change | Description |
|--------|--------|-------------|
| ProductCard | React.memo | 商品卡片组件 memo 化，减少重渲染 |
| Cart | 布局优化 | 移动端单列、PC 端双列布局 |

---

## v1.2.0 - 2026-04-26

### Phase 4: Admin Feature Enhancement - Advanced Components

#### New Components

| Module | Feature | Description |
|--------|---------|-------------|
| VariantManager | 商品变体管理 | 支持属性组配置、变体组合生成、批量编辑功能 |
| VariantManager | 属性组管理 | 颜色、尺寸、材质等自定义属性组 |
| VariantManager | 变体生成 | 笛卡尔积算法生成变体组合 |
| VariantManager | 批量编辑 | 批量价格/库存编辑，SKU 自动生成 |
| InventoryAlert | 智能库存预警 | 基于销量的智能库存预警系统 |
| InventoryAlert | 预警级别 | 紧急/警告/注意/正常 四级预警 |
| InventoryAlert | 补货建议 | 可售天数预测，建议补货量计算 |
| AuditLog | 操作日志 | 完整的操作审计追踪 |
| AuditLog | 日志筛选 | 多维度筛选（操作类型、操作人、时间范围） |
| AuditLog | 详情对比 | 展开式详情查看（修改前后对比） |

#### Feature Enhancements

| Module | Feature | Description |
|--------|---------|-------------|
| DataExporter | PDF 导出 | 新增 PDF 格式导出支持 |
| DataExporter | jsPDF | 集成 jsPDF 和 jspdf-autotable |
| GlobalSearch | TypeScript Fix | 修复变量引用问题 |

#### Internationalization

| Module | Change | Description |
|--------|--------|-------------|
| zh.json | 新增 67 个翻译键 | 覆盖所有 Phase 4 新增功能 |
| en.json | 新增 67 个翻译键 | 英文翻译同步 |

#### Performance Optimization

| Module | Change | Description |
|--------|--------|-------------|
| AdminLayout | 重渲染优化 | Zustand 状态订阅精确化 |

#### Security Fixes

| Issue | Module | Fix Description |
|-------|--------|----------------|
| CSV Injection | DataExporter | CSV 导出注入漏洞防护 |

---

## v1.0.2 - 2026-04-23

### Bug Fixes

| Issue | Module | Fix Description |
|-------|--------|-----------------|
| Type Error | Auth/Session | 修复 `session.user.id` 类型错误 |
| Type Error | TypeScript | 修复 TypeScript 类型错误 - session.user.id 和 i18n locale |
| Functionality | i18n | 修复语言切换功能 |

---

## v1.0.0 - 2026-04-21

### Phase 5: Framework and Tremor Component Integration

#### Framework Upgrades

| Module | Feature | Description |
|--------|---------|-------------|
| Refine | Admin Framework | 集成 Refine 框架用于后台管理 |
| Tremor | Data Visualization | 集成 Tremor 组件库用于数据可视化 |

**Modules Affected:**
- Admin Dashboard
- Data Analytics
- Order Management
- Customer Management
- Marketing Tools
- Distribution System

#### Completed Features

- ✅ Refine 框架集成
- ✅ Tremor 图表组件
- ✅ Phase 5 所有功能模块完成

---

## Version History Summary

### Feature Categories by Version

| Category | v1.0.2 | v1.0.0 |
|----------|--------|--------|
| UI/UX | ✅ | ✅ |
| Bug Fixes | ✅ | - |
| Framework | - | ✅ |
| Icons | ✅ | - |
| Viewport Mode | ✅ | - |

### Technical Stack Evolution

```
v1.0.0 - v1.0.2
├── Refine Framework (Admin)
├── Tremor Components (Charts)
├── next-intl (i18n)
├── Zustand (State Management)
├── TanStack Query (Data Fetching)
├── next-themes (Dark Mode)
└── Stripe/PayPal (Payments)
```

---

## Migration Guides

### Upgrading to v1.0.x

**Breaking Changes:** None in v1.0.x range

**Recommended Actions:**
1. Clear browser cache after update (viewport mode changes)
2. Verify locale settings after language switch updates
3. Test mobile viewport mode on PC browsers

### Environment Variables

No new environment variables required for v1.0.x updates.

---

## Deprecation Notices

None in current release.

---

## Known Issues

None reported in current release.

---

## Contributors

Development by SoloSales Team

---

## Changelog Categories

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability patches
- **Performance**: Performance improvements
- **Refactor**: Code refactoring
- **UI/UX**: User interface and experience updates
- **Infrastructure**: DevOps, deployment, tooling updates

---

*This document is automatically updated with each release. For detailed commit history, visit the [GitHub repository](https://github.com/Dante-Xr/solo-sales).*
