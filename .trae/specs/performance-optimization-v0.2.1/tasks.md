# SoloSales v0.2.1 性能优化任务清单

## 版本信息
- **目标版本**: v0.2.1
- **制定日期**: 2026-03-24

---

## 执行任务列表

### Phase 1: 首屏加载优化 (P0)

#### Task 1.1: WelcomeModal 动态导入
**文件**: `src/app/page.tsx`

**执行步骤**:
1. 导入 `dynamic` 函数 from `next/dynamic`
2. 将 `import { WelcomeModal }` 改为动态导入
3. 配置 `ssr: false` 和 `loading` 回调
4. 添加中文注释说明优化目的

**验收标准**: WelcomeModal 不在首屏 JS bundle 中

---

#### Task 1.2: HomeCarousel 定时器优化
**文件**: `src/components/storefront/HomeCarousel.tsx`

**执行步骤**:
1. 移除 `useState` 管理 timer 状态
2. 使用 `useRef` 存储 timer，避免触发渲染
3. 保留 setInterval 但不调用 setTimer
4. 仅在滑动时才触发重渲染
5. 添加中文注释说明优化原因

**验收标准**: 轮播状态下每秒不再触发组件重渲染

---

#### Task 1.3: Context 嵌套层级优化
**文件**: `src/app/layout.tsx`

**执行步骤**:
1. 创建 `CombinedProviders` 组件，合并多个 Provider
2. 使用 `useMemo` 缓存 provider value 对象
3. 减少 Provider 嵌套层级从 6 层到 3 层
4. 保持各 Provider 功能独立性
5. 添加中文注释说明 Provider 合并策略

**验收标准**: 单一状态变更触发的重渲染组件数减少

---

### Phase 2: 页面切换优化 (P1)

#### Task 2.1: AuthProvider 动态导入
**文件**: `src/components/providers/AuthProvider.tsx`

**执行步骤**:
1. 使用 `dynamic` 函数动态导入 SessionProvider
2. 配置 `{ ssr: false }` 避免 SSR 问题
3. 保留 AuthProvider 包装接口不变
4. 添加中文注释说明优化目的

**验收标准**: AuthProvider 不影响首屏渲染时间

---

#### Task 2.2: UI 组件 React.memo 优化
**文件**:
- `src/components/ui/card.tsx`
- `src/components/ui/button.tsx`

**执行步骤**:
1. 导入 `memo` from `react`
2. 使用 `memo()` 包裹组件
3. 验证组件功能不受影响
4. 添加中文注释说明优化效果

**验收标准**: 组件在相同 props 下不重复渲染

---

#### Task 2.3: 商品卡片组件优化
**文件**: `src/components/storefront/ProductCard.tsx` (新建)

**执行步骤**:
1. 创建 ProductCard 独立组件
2. 使用 `React.memo` 包装
3. 从 page.tsx 中提取商品卡片逻辑
4. 传递必要的 props
5. 添加中文注释

**验收标准**: 商品列表滚动时减少重渲染

---

#### Task 2.4: 路由预加载配置
**文件**: `src/app/page.tsx`

**执行步骤**:
1. 使用 Next.js Link 组件的 `prefetch` 属性
2. 对主要导航链接启用预加载
3. 添加中文注释说明预加载策略

**验收标准**: 页面切换时间 < 200ms

---

### Phase 3: Bundle 优化 (P1)

#### Task 3.1: Bundle Analyzer 配置
**文件**: `next.config.ts`

**执行步骤**:
1. 导入 `@next/bundle-analyzer`
2. 配置 bundle analyzer plugin
3. 验证配置正确性
4. 添加中文注释说明用途

**验收标准**: `npm run analyze` 生成 bundle 报告

---

### Phase 4: 版本更新 (P2)

#### Task 4.1: 版本号更新
**文件**: `package.json`

**执行步骤**:
1. 将 version 从 `0.1.0` 改为 `0.2.1`
2. 同步更新 metadata 版本信息

---

#### Task 4.2: 创建变更日志
**文件**: `CHANGELOG.md` (新建)

**执行步骤**:
1. 创建 CHANGELOG.md 文件
2. 记录 v0.2.1 性能优化内容
3. 包含优化项目列表和日期

---

## 任务完成标准

### 构建验证
- [ ] `npm run build` 成功
- [ ] `npm run lint` 无错误
- [ ] 开发服务器 `npm run dev` 正常

### 性能验证
- [ ] 首屏加载时间减少 30%
- [ ] 页面切换响应时间 < 200ms
- [ ] Bundle 大小可分析