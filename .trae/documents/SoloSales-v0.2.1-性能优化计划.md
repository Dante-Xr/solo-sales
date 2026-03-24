# SoloSales v0.2.1 性能优化实施计划

## 版本信息
- **计划版本**: v0.2.1
- **制定日期**: 2026-03-24
- **目标**: 页面首次加载时间减少30%以上，页面切换响应时间控制在200ms以内

---

## 一、现状分析

### 1.1 已有优化措施
| 类别 | 现状 | 状态 |
|------|------|------|
| 图片优化 | next.config.ts 已配置 AVIF/WebP | ✅ 已完成 |
| 包导入优化 | optimizePackageImports: lucide-react | ✅ 已完成 |
| Context 缓存 | CartContext/WishlistContext 使用 useMemo | ✅ 已完成 |
| 静态数据 | FEATURED_PRODUCTS 已移到组件外部 | ✅ 已完成 |

### 1.2 性能瓶颈识别

| 优先级 | 问题 | 影响 | 位置 |
|--------|------|------|------|
| P0 | Context 嵌套过深 (6层 providers) | 每次状态变更触发全量重渲染 | layout.tsx |
| P0 | 动态组件未使用懒加载 | WelcomeModal 等非首屏组件占用 JS | page.tsx |
| P0 | HomeCarousel 定时器频繁更新 state | 每秒触发重渲染 | HomeCarousel.tsx |
| P1 | 页面切换无预加载策略 | 导航延迟 | 全局链接 |
| P1 | React.memo 缺失 | 不必要的子组件重渲染 | 多个组件 |
| P1 | 翻译文件全量加载 | 首屏 JS 体积增大 | translations.ts |
| P2 | 缺少 Bundle 分析配置 | 无法量化优化效果 | next.config.ts |
| P2 | AuthProvider 使用 SessionProvider | 客户端全量加载 | AuthProvider.tsx |

---

## 二、实施步骤

### Phase 1: 首屏加载优化 (P0)

#### Task 1.1: 动态导入 WelcomeModal
**文件**: `src/app/page.tsx`

**修改内容**:
```typescript
// 静态导入 → 动态导入
import { WelcomeModal } from "@/components/storefront/WelcomeModal"
// 改为
const WelcomeModal = dynamic(() => import("@/components/storefront/WelcomeModal"), {
  loading: () => null,
  ssr: false
})
```

**验证标准**: WelcomeModal 不在首屏 JS bundle 中

---

#### Task 1.2: 优化 HomeCarousel 定时器
**文件**: `src/components/storefront/HomeCarousel.tsx`

**问题**: 每秒 setTimer 触发重渲染

**修改内容**:
1. 使用 ref 存储 timer 状态，不触发渲染
2. 使用 requestAnimationFrame 或 setInterval 仅更新 DOM
3. 移除每秒的 setTimer 调用

```typescript
// 修改前
const [_timer, setTimer] = React.useState(AUTO_PLAY_DELAY)
timerRef.current = setInterval(() => {
  setTimer((prev) => { ... })
}, 1000)

// 修改后: 使用 ref 存储，不触发渲染
const timerRef = React.useRef<{ interval: NodeJS.Timeout; lastTick: number } | null>(null)
```

**验证标准**: 轮播状态下 CPU 占用降低

---

#### Task 1.3: 减少 Context 嵌套层级
**文件**: `src/app/layout.tsx`

**问题**: 6层嵌套 providers 导致重渲染链条过长

**修改内容**:
1. 合并可以合并的 providers
2. 使用 `use memo` 缓存 provider values
3. 将 ThemeProvider 和 AuthProvider 合并为一个 AuthThemeProvider

```typescript
// 合并前: 6个独立 Provider
<ThemeProvider>
  <AuthProvider>
    <LanguageProvider>
      <WishlistProvider>
        <CartProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </CartProvider>
      </WishlistProvider>
    </LanguageProvider>
  </AuthProvider>
</ThemeProvider>

// 合并后: 减少到 3个
<CombinedProvider>
  <CartProvider>
    <TooltipProvider>{children}</TooltipProvider>
  </CartProvider>
</CombinedProvider>
```

**验证标准**: 单一状态变更触发的重渲染组件数减少 50%

---

### Phase 2: 页面切换优化 (P1)

#### Task 2.1: 实现路由预加载
**文件**: `src/app/page.tsx`, `src/components/storefront/HomeCarousel.tsx`

**修改内容**:
1. 在 Link 组件上添加 `prefetch` 属性
2. 对主要导航链接启用预加载

```typescript
// 在商品卡片链接上
<Link href={`/product/${product.id}`} prefetch={true}>
```

**验证标准**: 页面切换时间 < 200ms

---

#### Task 2.2: 添加 React.memo 到重渲染组件
**文件**: 多个组件

**修改内容**:
```typescript
// Button, Card, Badge 等基础组件使用 memo
import { memo } from 'react'
export const Card = memo(function Card({ ... }) { ... })

// 商品卡片组件
const ProductCard = memo(function ProductCard({ product, ... }) {
  return ( ... )
})
```

**涉及组件**:
- `src/components/ui/card.tsx`
- `src/components/ui/button.tsx`
- `src/components/storefront/ProductCard` (新建)

---

#### Task 2.3: 翻译文件按需加载
**文件**: `src/i18n/translations.ts`

**修改内容**:
1. 将 translations 拆分为多个小文件
2. 首屏只加载当前语言的翻译
3. 其他语言懒加载

---

### Phase 3: Bundle 优化 (P1-P2)

#### Task 3.1: 配置 Bundle Analyzer
**文件**: `next.config.ts`, `package.json`

**修改内容**:
```typescript
// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
```

**验证标准**: `npm run analyze` 生成 bundle 分析报告

---

#### Task 3.2: 优化 AuthProvider
**文件**: `src/components/providers/AuthProvider.tsx`

**问题**: SessionProvider 客户端全量加载

**修改内容**:
```typescript
// 使用动态导入
const SessionProvider = dynamic(
  () => import('next-auth/react').then(mod => mod.SessionProvider),
  { ssr: false }
)
```

---

### Phase 4: 版本更新与日志 (P2)

#### Task 4.1: 更新版本号
**文件**: `package.json`, `src/app/layout.tsx` (metadata)

**修改内容**:
```json
// package.json
{
  "version": "0.2.1",
  ...
}
```

---

#### Task 4.2: 性能优化变更日志
**文件**: `CHANGELOG.md` (新建)

**内容**:
```markdown
# v0.2.1 (2026-03-24)

## 性能优化
- 首页 WelcomeModal 改为动态导入，减少首屏 JS 体积
- HomeCarousel 定时器优化，减少不必要的重渲染
- Context 嵌套层级优化，减少重渲染组件数量
- 商品卡片添加 React.memo，减少不必要渲染
- AuthProvider 动态导入，优化首屏加载
- 路由预加载策略启用，提升页面切换速度
```

---

## 三、文件修改清单

| 顺序 | 文件 | 修改类型 | 优先级 |
|------|------|----------|--------|
| 1 | `src/app/page.tsx` | 动态导入 WelcomeModal | P0 |
| 2 | `src/components/storefront/HomeCarousel.tsx` | 定时器优化 | P0 |
| 3 | `src/app/layout.tsx` | Context 合并 | P0 |
| 4 | `src/components/providers/AuthProvider.tsx` | 动态导入 | P1 |
| 5 | `src/components/ui/card.tsx` | React.memo | P1 |
| 6 | `src/components/ui/button.tsx` | React.memo | P1 |
| 7 | `src/i18n/translations.ts` | 按需加载 | P1 |
| 8 | `next.config.ts` | Bundle Analyzer | P1 |
| 9 | `package.json` | 版本号 0.2.1 | P2 |
| 10 | `CHANGELOG.md` | 新建 | P2 |

---

## 四、测试验证清单

- [ ] Lighthouse Performance Score >= 90
- [ ] 首屏加载时间减少 30%
- [ ] 页面切换响应时间 < 200ms
- [ ] Bundle 大小通过 `npm run analyze` 验证
- [ ] `npm run build` 无错误
- [ ] `npm run lint` 无错误

---

## 五、风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 动态导入导致 FOUC | 视觉闪烁 | 使用 loading skeleton |
| Context 合并导致耦合 | 维护性下降 | 保持 Provider 独立性 |
| React.memo 误用 | 内存占用增加 | 仅对频繁渲染组件使用 |

---

**计划制定完成，等待用户确认后执行。**