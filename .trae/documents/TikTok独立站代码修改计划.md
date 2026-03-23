# TikTok独立站优化代码修改计划

> 生成日期：2026-03-23
> 依据：TikTok独立站优化报告.md

---

## 实施总览

| 阶段 | 时间 | 优先级 | 主要任务 |
|------|------|--------|---------|
| 第一阶段 | P0 | 暗色模式 + 轮播动效 |
| 第二阶段 | P1 | 限时标签 + 热搜词 + 分享功能 |
| 第三阶段 | P2 | 收藏功能 + 新用户弹窗 |
| 第四阶段 | P1 | 图片优化 + 骨架屏 |

---

## 第一阶段：P0 核心体验改造

### 任务 1.1：暗色模式支持

**目标**：为应用添加完整的暗色模式支持，符合TikTok用户习惯

**修改文件**：
- `src/app/globals.css`
- `src/app/layout.tsx`

**具体步骤**：

1. **更新 globals.css**：
   - 检查并完善 `.dark` 主题变量
   - 确保 `--background`、`--foreground`、`--card` 等变量在暗色模式下有正确的 oklch 值
   - 添加暗色模式特有的颜色映射

2. **更新 layout.tsx**：
   - 添加 ThemeProvider 或使用 Next-themes 实现主题切换
   - 在 html 标签上添加 `dark` class 切换逻辑
   - 确保 LanguageProvider 和 ThemeProvider 正确嵌套

3. **验证**：
   - 在浏览器 DevTools 中手动切换 `.dark` class
   - 验证所有组件在暗色模式下显示正确

---

### 任务 1.2：轮播组件动效升级

**目标**：将轮播从基础箭头升级为圆点指示器 + 进度条效果

**修改文件**：
- `src/components/storefront/HomeCarousel.tsx`

**具体步骤**：

1. 添加 `currentIndex` 状态追踪当前轮播位置
2. 在 Embla `onSelect` 回调中更新 `currentIndex`
3. 将数字计时器替换为圆点指示器
4. 为当前激活的圆点添加宽度动画效果
5. 保持原有的10秒自动切换逻辑

**代码变更要点**：
```tsx
// 添加状态
const [currentIndex, setCurrentIndex] = useState(0)

// 在 useEffect 中添加 onSelect 监听
embla.on('select', () => {
  setCurrentIndex(embla.selectedScrollSnap())
})

// 替换底部计时器为圆点指示器
<div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
  {products.map((_, i) => (
    <div
      key={i}
      className={`h-1 rounded-full transition-all duration-300 ${
        i === currentIndex ? 'w-6 bg-white' : 'w-1 bg-white/50'
      }`}
    />
  ))}
</div>
```

---

### 任务 1.3：商品卡片悬浮动效

**目标**：为首页商品网格添加 TikTok 风格的卡片动效

**修改文件**：
- `src/app/page.tsx`

**具体步骤**：

1. 找到商品卡片组件
2. 在 `Card` 的 className 中添加：
   - `transition-transform duration-200`
   - `hover:scale-[1.02]`
   - `active:scale-[0.98]`
   - `hover:shadow-lg`

---

## 第二阶段：P1 内容呈现升级

### 任务 2.1：限时特惠悬浮标签

**目标**：在轮播商品卡片上添加限时特惠标签

**修改文件**：
- `src/components/storefront/HomeCarousel.tsx`

**具体步骤**：

1. 在商品图片上添加 Badge 组件
2. 使用渐变背景 `bg-gradient-to-r from-red-500 to-orange-500`
3. 添加 `animate-pulse` 动画效果
4. 中英文文案根据 `isZh` 切换

---

### 任务 2.2：销量实时跳动动画

**目标**：在商品卡片上添加"正在观看人数"和"已售"动态显示

**修改文件**：
- `src/app/page.tsx`（首页商品卡片）
- `src/app/product/[id]/page.tsx`（商品详情页）

**具体步骤**：

1. 为 FEATURED_PRODUCTS 添加 mock 销量数据
2. 添加"正在看"人数显示（随机数 50-150）
3. 添加"已售"数量显示
4. 使用 `setInterval` 每30秒更新一次随机数

---

### 任务 2.3：搜索框热搜词增强

**目标**：为搜索框添加热搜词提示功能

**修改文件**：
- `src/components/storefront/SearchBox.tsx`

**具体步骤**：

1. 添加热搜词数组
   ```tsx
   const hotSearchTerms = {
     zh: ["#网红爆款", "#限时秒杀", "#抖音同款"],
     en: ["#trending", "#flashsale", "#viral"]
   }
   ```
2. 在 Input placeholder 中添加动态热搜词
3. 在搜索历史下方添加热搜词快捷入口
4. 点击热搜词直接触发搜索

---

### 任务 2.4：一键分享功能

**目标**：在商品详情页添加社交分享按钮

**修改文件**：
- `src/app/product/[id]/page.tsx`

**具体步骤**：

1. 添加分享按钮到商品操作栏
2. 实现 Web Share API 或降级方案
3. 支持复制链接功能
4. 中英文文案适配

**代码实现**：
```tsx
const shareProduct = async () => {
  if (navigator.share) {
    await navigator.share({
      title: product.name,
      text: isZh ? "发现一个超赞的商品！" : "Check out this!",
      url: window.location.href
    })
  } else {
    await navigator.clipboard.writeText(window.location.href)
    toast(isZh ? "链接已复制" : "Link copied!")
  }
}
```

---

## 第三阶段：P2 用户留存体系

### 任务 3.1：商品收藏/心愿单功能

**目标**：实现商品收藏功能，支持本地存储

**修改文件**：
- `src/context/WishlistContext.tsx`（新建）
- `src/app/page.tsx`
- `src/app/product/[id]/page.tsx`
- `src/components/storefront/UserMenu.tsx`

**具体步骤**：

1. **创建 WishlistContext**：
   - 使用 localStorage 存储 wishlist 数组
   - 提供 `addToWishlist`、`removeFromWishlist`、`isInWishlist` 方法
   - 同步到 localStorage

2. **在商品卡片添加收藏按钮**：
   - 心脏图标组件
   - 点击切换收藏状态
   - 动画效果

3. **在 UserMenu 添加"我的收藏"入口**

---

### 任务 3.2：新用户欢迎弹窗

**目标**：首次访问用户显示优惠引导弹窗

**修改文件**：
- `src/components/storefront/WelcomeModal.tsx`（新建）
- `src/app/layout.tsx` 或 `src/app/page.tsx`

**具体步骤**：

1. **创建 WelcomeModal 组件**：
   - 检测 `localStorage.has_visited`
   - 2秒后显示弹窗
   - 显示新人优惠券信息
   - 关闭后设置 `has_visited = true`

2. **添加到首页**：
   - 在 Storefront 组件中引入
   - 控制显示状态

3. **实现优惠券领取逻辑**：
   - 生成优惠码存储到 localStorage
   - 结账时检测并应用优惠

---

## 第四阶段：P1 性能优化

### 任务 4.1：Next.js Image 组件替换

**目标**：将所有 `<img>` 标签替换为 `next/image` 组件

**修改文件**：
- `src/components/storefront/HomeCarousel.tsx`
- `src/app/page.tsx`
- `src/app/cart/page.tsx`
- `src/app/product/[id]/page.tsx`
- `src/components/checkout/EnhancedCheckoutModal.tsx`

**具体步骤**：

1. 逐文件将 `<img src={...} />` 替换为：
   ```tsx
   import Image from 'next/image'

   <Image
     src={product.image}
     alt={product.name}
     fill
     className="object-cover"
   />
   ```

2. 对于远端图片，在 `next.config.ts` 中配置域名白名单
   ```ts
   images: {
     remotePatterns: [
       { hostname: 'images.unsplash.com' }
     ]
   }
   ```

3. 添加 placeholder blur（可选，提升体验）

---

### 任务 4.2：骨架屏加载状态

**目标**：在商品列表加载时显示骨架屏

**修改文件**：
- `src/app/page.tsx`
- `src/app/cart/page.tsx`

**具体步骤**：

1. 创建 Skeleton 组件或使用 shadcn/ui 的 Skeleton
2. 在数据加载前显示 4-6 个骨架卡片
3. 样式：与实际商品卡片尺寸一致

---

### 任务 4.3：路由懒加载

**目标**：将大型组件改为动态导入

**修改文件**：
- `src/app/page.tsx`
- `src/app/layout.tsx`

**具体步骤**：

1. 对 EnhancedCheckoutModal 使用 dynamic import
   ```tsx
   const EnhancedCheckoutModal = dynamic(
     () => import('@/components/checkout/EnhancedCheckoutModal'),
     { loading: () => <div>Loading...</div> }
   )
   ```

2. 对 AuthModal 使用 dynamic import

---

## 实施检查清单

### P0 阶段检查项
- [ ] 暗色模式 CSS 变量完整
- [ ] 主题切换功能正常
- [ ] 轮播圆点指示器显示正确
- [ ] 当前圆点有动画效果
- [ ] 商品卡片悬浮动效生效

### P1 阶段检查项
- [ ] 限时特惠标签显示
- [ ] 销量/观看人数动态更新
- [ ] 热搜词搜索功能
- [ ] 分享按钮正常工作
- [ ] 图片加载使用 next/image

### P2 阶段检查项
- [ ] 收藏按钮添加/移除正常
- [ ] 收藏数据持久化
- [ ] 新用户弹窗首次显示
- [ ] 优惠券领取逻辑
- [ ] 骨架屏加载显示

---

## 依赖关系说明

```
P0（第一阶段）
├── 暗色模式 → 为后续所有页面提供基础
├── 轮播动效 → 独立组件
└── 卡片动效 → 独立组件

P1（第二阶段）
├── 限时标签 → 依赖 HomeCarousel
├── 热搜词 → 依赖 SearchBox
├── 分享功能 → 依赖商品详情页
└── 图片优化 → 依赖 next.config 配置

P2（第三阶段）
├── 收藏功能 → 需要 WishlistContext
└── 新用户弹窗 → 独立组件

P1（第四阶段）
├── 图片优化 → 独立优化
└── 骨架屏 → 独立优化
```

---

## 建议实施顺序

1. **任务 1.1** - 暗色模式（基础架构）
2. **任务 1.2** - 轮播动效（用户立刻可见）
3. **任务 1.3** - 卡片动效（用户立刻可见）
4. **任务 2.1** - 限时标签（转化提升）
5. **任务 2.3** - 热搜词（搜索体验）
6. **任务 4.1** - 图片优化（性能提升）
7. **任务 2.2** - 销量动态（社交证明）
8. **任务 3.1** - 收藏功能（留存）
9. **任务 2.4** - 分享功能（裂变）
10. **任务 3.2** - 新用户弹窗（首单转化）
11. **任务 4.2** - 骨架屏（体验优化）
12. **任务 4.3** - 路由懒加载（性能优化）
