# SoloSales v0.2 实施检查清单

## 开发前检查

- [ ] 当前代码已提交 Git
- [ ] 已阅读 v0.2-性能安全优化计划.md
- [ ] 已理解 spec.md 中的所有规格
- [ ] 开发环境 Node.js 和依赖正常

---

## Phase 1: 安全修复 (P0)

### Task 1.1: 密码加密实现

#### 代码检查
- [ ] `bcryptjs` 已导入
- [ ] 密码验证函数已实现 (长度≥8，包含字母数字)
- [ ] 使用 `bcrypt.hash(password, 10)` 加密
- [ ] 明文密码不再存储

#### 测试检查
- [ ] 注册用户后密码为 hash 格式
- [ ] 相同密码每次 hash 结果不同
- [ ] 弱密码被拒绝

#### 注释检查
- [ ] 文件顶部有中文功能描述
- [ ] 关键逻辑有中文注释
- [ ] 2026-03-24 日期标注

---

### Task 1.2: 环境变量验证增强

#### 代码检查
- [ ] `env-validator.ts` 已创建
- [ ] `validateRedisConfig()` 函数存在
- [ ] `validateStripeConfig()` 函数存在
- [ ] 缺少变量时抛出明确错误
- [ ] Mock 值不再作为默认值

#### 集成检查
- [ ] `redis.ts` 使用验证函数
- [ ] `stripe/route.ts` 使用验证函数

#### 测试检查
- [ ] 缺少 Redis URL 时启动失败
- [ ] 缺少 Stripe Key 时启动失败
- [ ] 错误信息清晰明确

---

### Task 1.3: Rate Limiting 中间件

#### 代码检查
- [ ] 限流逻辑使用 Map 存储
- [ ] 记录请求时间戳
- [ ] 支持时间窗口滑动
- [ ] 超限时返回 429 状态码

#### 规则检查
- [ ] 注册 API: 3次/5分钟
- [ ] 支付 API: 10次/5分钟
- [ ] 搜索 API: 30次/1分钟

#### 测试检查
- [ ] 连续请求超限后返回 429
- [ ] 时间窗口后可重试
- [ ] 不同 IP 独立计数

---

## Phase 2: API 安全增强 (P1)

### Task 2.1: Zod 请求验证

#### 代码检查
- [ ] `zod` 已安装到 dependencies
- [ ] `validators.ts` 已创建
- [ ] `registerSchema` 正确定义
- [ ] `stripeSchema` 正确定义
- [ ] `paypalSchema` 正确定义

#### 集成检查
- [ ] `/api/auth/register` 使用 registerSchema
- [ ] `/api/checkout/stripe` 使用 stripeSchema
- [ ] `/api/checkout/paypal` 使用 paypalSchema

#### 测试检查
- [ ] 无效 email 被拒绝
- [ ] 无效密码格式被拒绝
- [ ] 缺少必需字段被拒绝
- [ ] 返回具体错误信息

---

### Task 2.2: 安全响应头

#### 配置检查
- [ ] `next.config.ts` 已更新
- [ ] `X-Frame-Options` 设置为 SAMEORIGIN
- [ ] `Strict-Transport-Security` 配置正确
- [ ] `X-Content-Type-Options` 设置为 nosniff
- [ ] `Content-Security-Policy` 基础策略已配置

---

## Phase 3: 性能优化 (P1-P2)

### Task 3.1: Next.js 图片优化

#### 配置检查
- [ ] `formats: ['image/avif', 'image/webp']` 已设置
- [ ] `deviceSizes` 已配置
- [ ] `imageSizes` 已配置
- [ ] `optimizePackageImports: ['lucide-react']` 已添加

---

### Task 3.2: Bundle 分析配置

#### 安装检查
- [ ] `@next/bundle-analyzer` 已安装
- [ ] `analyze` 脚本已添加到 package.json

#### 运行检查
- [ ] `npm run analyze` 可正常执行
- [ ] 生成 bundle 分析报告

---

### Task 3.3: Context 性能优化

#### CartContext 检查
- [ ] `cartTotal` 使用 `useMemo`
- [ ] `cartCount` 使用 `useMemo`
- [ ] 依赖数组正确

#### WishlistContext 检查
- [ ] 类似优化已应用

---

### Task 3.4: 静态数据优化

#### page.tsx 检查
- [ ] `FEATURED_PRODUCTS` 在组件外部定义
- [ ] 不再每次渲染重新创建

#### HomeCarousel.tsx 检查
- [ ] 静态数据已优化

---

## 开发后检查

### 代码质量
- [ ] `npm run lint` 通过
- [ ] TypeScript 编译无错误
- [ ] 所有新增代码有中文注释
- [ ] 无 `console.log` 遗留 (调试用的除外)

### 功能验证
- [ ] 应用可正常启动 `npm run dev`
- [ ] 注册功能正常
- [ ] 限流功能生效
- [ ] 图片加载正常

### Git 提交
- [ ] 创建 v0.2 分支
- [ ] 提交所有修改
- [ ] 提交信息清晰

---

## 部署检查

- [ ] 环境变量已配置到 Vercel
- [ ] Vercel preview 部署成功
- [ ] 功能测试通过
- [ ] 合并到 main 分支

---

**所有检查项完成后，v0.2 实施才算结束。**
