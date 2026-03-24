# SoloSales v0.2 任务清单

## Phase 1: 安全修复 (P0)

### Task 1.1: 密码加密实现
**状态**: pending
**文件**: `src/app/api/auth/register/route.ts`
**检查清单**:
- [ ] 导入 bcryptjs
- [ ] 添加密码强度验证函数
- [ ] 使用 bcrypt.hash() 加密密码
- [ ] 添加中文注释

---

### Task 1.2: 环境变量验证增强
**状态**: pending
**文件**: `src/lib/env-validator.ts` (新建), `src/lib/redis.ts`, `src/app/api/checkout/stripe/route.ts`
**检查清单**:
- [ ] 创建 env-validator.ts
- [ ] 实现环境变量验证函数
- [ ] 更新 redis.ts 使用验证函数
- [ ] 更新 stripe route 使用验证函数
- [ ] 添加中文注释

---

### Task 1.3: Rate Limiting 中间件
**状态**: pending
**文件**: `src/middleware/rate-limit.ts` (新建)
**检查清单**:
- [ ] 实现内存存储的限流器
- [ ] 实现注册 API 限流 (3次/5分钟)
- [ ] 实现支付 API 限流 (10次/5分钟)
- [ ] 实现搜索 API 限流 (30次/1分钟)
- [ ] 返回 429 状态码
- [ ] 添加中文注释

---

## Phase 2: API 安全增强 (P1)

### Task 2.1: Zod 请求验证
**状态**: pending
**文件**: `src/lib/validators.ts` (新建)
**检查清单**:
- [ ] 安装 zod 依赖
- [ ] 创建注册验证 Schema
- [ ] 创建 Stripe 验证 Schema
- [ ] 创建 PayPal 验证 Schema
- [ ] 导出验证函数
- [ ] 添加中文注释

---

### Task 2.2: 安全响应头
**状态**: pending
**文件**: `next.config.ts`
**检查清单**:
- [ ] 添加 securityHeaders 配置
- [ ] X-Frame-Options 配置
- [ ] HSTS 配置
- [ ] CSP 基础策略
- [ ] 添加中文注释

---

## Phase 3: 性能优化 (P1-P2)

### Task 3.1: Next.js 图片优化
**状态**: pending
**文件**: `next.config.ts`
**检查清单**:
- [ ] 启用 AVIF/WebP 格式
- [ ] 配置 deviceSizes
- [ ] 配置 imageSizes
- [ ] 添加 optimizePackageImports
- [ ] 添加中文注释

---

### Task 3.2: Bundle 分析配置
**状态**: pending
**文件**: `package.json`, `next.config.ts`
**检查清单**:
- [ ] 安装 @next/bundle-analyzer
- [ ] 添加 analyze 脚本
- [ ] 配置 bundle 分析器
- [ ] 添加中文注释

---

### Task 3.3: Context 性能优化
**状态**: pending
**文件**: `src/context/CartContext.tsx`, `src/context/WishlistContext.tsx`
**检查清单**:
- [ ] 使用 useMemo 缓存 cartTotal
- [ ] 使用 useMemo 缓存 cartCount
- [ ] 优化 addToCart 逻辑
- [ ] 添加中文注释

---

### Task 3.4: 静态数据优化
**状态**: pending
**文件**: `src/app/page.tsx`, `src/components/storefront/HomeCarousel.tsx`
**检查清单**:
- [ ] FEATURED_PRODUCTS 移到组件外部
- [ ] 使用 useMemo 缓存计算值
- [ ] 添加中文注释

---

## 任务完成标准

1. 所有 Task 的检查清单完成
2. 代码通过 ESLint 检查
3. TypeScript 编译无错误
4. 本地运行正常
