# SoloSales v0.2 性能与安全优化 - 实施规格

## 版本信息
- **版本号**: v0.2
- **基于计划**: v0.2-性能安全优化计划.md
- **实施日期**: 2026-03-24

---

## 一、核心目标

1. **安全性增强**: 修复 P0 安全漏洞，防止用户数据泄露和 API 滥用
2. **性能优化**: 提升页面加载速度和运行时性能
3. **代码质量**: 引入验证层和监控工具

---

## 二、修改范围

### 2.1 Phase 1: 安全修复 (P0)

#### Task 1.1: 密码加密实现
- **文件**: `src/app/api/auth/register/route.ts`
- **目标**: 用户密码必须使用 bcrypt 加密存储
- **实现**:
  - 导入 `bcryptjs`
  - 使用 `bcrypt.hash(password, 10)` 加密
  - 添加密码强度验证 (最少8位，包含字母和数字)

#### Task 1.2: 环境变量验证增强
- **文件**: `src/lib/env-validator.ts` (新建), `src/lib/redis.ts`, `src/app/api/checkout/stripe/route.ts`
- **目标**: 确保必需环境变量存在，防止 Mock 值泄露到生产
- **实现**:
  - 创建统一的环境变量验证模块
  - 所有敏感配置必须通过验证函数获取
  - 缺少必需变量时抛出明确错误

#### Task 1.3: Rate Limiting 中间件
- **文件**: `src/middleware/rate-limit.ts` (新建)
- **目标**: 防止 API 被暴力攻击
- **实现**:
  - 基于内存的 IP 限流 (生产环境建议使用 Redis)
  - 注册 API: 5分钟内心注册不超过 3 次
  - 支付 API: 5分钟内心支付不超过 10 次
  - 搜索 API: 1分钟内不超过 30 次
  - 超限返回 HTTP 429

---

### 2.2 Phase 2: API 安全增强 (P1)

#### Task 2.1: Zod 请求验证
- **文件**: `src/lib/validators.ts` (新建)
- **目标**: 验证所有 API 请求参数
- **实现**:
  - 注册: `z.object({ email, password, name })`
  - Stripe: `z.object({ productId, productName, price, quantity })`
  - PayPal: `z.object({ price, quantity })`
  - 无效请求返回 400 + 具体错误信息

#### Task 2.2: 安全响应头
- **文件**: `next.config.ts`
- **目标**: 添加浏览器安全保护
- **实现**:
  - X-Frame-Options: SAMEORIGIN
  - Strict-Transport-Security: max-age=63072000
  - X-Content-Type-Options: nosniff
  - Content-Security-Policy: 基础策略

---

### 2.3 Phase 3: 性能优化 (P1-P2)

#### Task 3.1: Next.js 图片优化
- **文件**: `next.config.ts`
- **目标**: 减少图片加载时间
- **实现**:
  - 启用 AVIF/WebP 自动转换
  - 配置响应式图片尺寸
  - 优化 lucide-react 导入

#### Task 3.2: Bundle 分析配置
- **文件**: `package.json`, `next.config.ts`
- **目标**: 监控包大小变化
- **实现**:
  - 安装 `@next/bundle-analyzer`
  - 添加 `"analyze": "ANALYZE=true next build"` 脚本

#### Task 3.3: Context 性能优化
- **文件**: `src/context/CartContext.tsx`, `src/context/WishlistContext.tsx`
- **目标**: 减少不必要的重渲染
- **实现**:
  - 使用 `useMemo` 缓存 `cartTotal`, `cartCount`
  - 优化状态更新逻辑

#### Task 3.4: 静态数据优化
- **文件**: `src/app/page.tsx`, `src/components/storefront/HomeCarousel.tsx`
- **目标**: 减少内存分配
- **实现**:
  - `FEATURED_PRODUCTS` 移到组件外部
  - 使用 `useMemo` 缓存派生数据

---

## 三、代码规范

### 3.1 中文注释要求
- 所有新增和修改的函数必须添加中文注释
- 注释格式: `// 描述功能，2026-03-24`
- 复杂逻辑需要分行注释

### 3.2 错误处理
- 所有 async 操作必须使用 try-catch
- 错误日志使用 `console.error` 并包含上下文信息
- 敏感信息不允许输出到日志

### 3.3 类型安全
- 优先使用 TypeScript 严格模式
- 避免使用 `any` 类型
- API 返回类型必须明确声明

---

## 四、测试验证

### 4.1 功能验证
- [ ] 注册新用户后数据库存储 bcrypt hash
- [ ] 缺少环境变量时应用启动失败
- [ ] Rate Limit 超限返回 429
- [ ] 无效 API 参数返回 400
- [ ] 图片格式自动转换生效

### 4.2 性能验证
- [ ] Bundle 分析可正常运行
- [ ] Context 重渲染次数减少
- [ ] 页面加载时间改善

---

## 五、风险控制

### 5.1 回滚方案
- 所有修改使用 Git 分支管理
- 修改前创建备份 commit
- 出现问题可通过 `git revert` 回滚

### 5.2 渐进式部署
- 先在本地完整测试
- 然后部署到 Vercel preview
- 最后合并到 main 分支

---

**规格制定完成，待用户确认后执行。**
