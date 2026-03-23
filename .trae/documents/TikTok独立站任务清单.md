# TikTok独立站优化 - 任务清单

> 生成日期：2026-03-23
> 总任务数：12个

---

## P0 阶段：核心体验改造

### 任务 1.1：暗色模式支持
- [ ] 修改 `src/app/globals.css` - 完善 .dark 主题变量
- [ ] 修改 `src/app/layout.tsx` - 添加 ThemeProvider
- [ ] 安装 next-themes 依赖
- [ ] 验证主题切换功能正常

### 任务 1.2：轮播组件动效升级
- [ ] 修改 `src/components/storefront/HomeCarousel.tsx`
- [ ] 添加 currentIndex 状态
- [ ] 添加 onSelect 事件监听
- [ ] 替换数字计时器为圆点指示器
- [ ] 验证圆点动画效果

### 任务 1.3：商品卡片悬浮动效
- [ ] 修改 `src/app/page.tsx`
- [ ] 为商品卡片添加 transition-transform 类
- [ ] 添加 hover:scale-[1.02] 效果
- [ ] 添加 active:scale-[0.98] 效果
- [ ] 添加 hover:shadow-lg 效果

---

## P1 阶段：内容呈现升级

### 任务 2.1：限时特惠悬浮标签
- [ ] 修改 `src/components/storefront/HomeCarousel.tsx`
- [ ] 添加限时特惠 Badge 组件
- [ ] 添加 bg-gradient-to-r 渐变背景
- [ ] 添加 animate-pulse 动画
- [ ] 更新 translations.ts 添加翻译键

### 任务 2.2：销量实时跳动动画
- [ ] 修改 `src/app/page.tsx`
- [ ] 为 FEATURED_PRODUCTS 添加 sales 字段
- [ ] 添加"正在看"动态人数显示
- [ ] 添加"已售"数量显示
- [ ] 验证数字动态更新

### 任务 2.3：搜索框热搜词增强
- [ ] 修改 `src/components/storefront/SearchBox.tsx`
- [ ] 添加 hotSearchTerms 数组
- [ ] 添加热搜词显示区域
- [ ] 实现点击热搜词执行搜索
- [ ] 更新 translations.ts 添加翻译键

### 任务 2.4：一键分享功能
- [ ] 修改 `src/app/product/[id]/page.tsx`
- [ ] 添加 Share2 图标导入
- [ ] 实现 handleShare 异步函数
- [ ] 添加 Web Share API 支持
- [ ] 添加复制链接降级方案
- [ ] 在底部操作栏添加分享按钮
- [ ] 更新 translations.ts 添加翻译键

---

## P2 阶段：用户留存体系

### 任务 3.1：商品收藏/心愿单功能
- [ ] 创建 `src/context/WishlistContext.tsx`
- [ ] 实现 WishlistProvider
- [ ] 实现 addToWishlist/removeFromWishlist 方法
- [ ] 实现 isInWishlist/toggleWishlist 方法
- [ ] 修改 `src/app/layout.tsx` 添加 WishlistProvider
- [ ] 修改 `src/app/product/[id]/page.tsx` 添加收藏按钮
- [ ] 修改 `src/app/page.tsx` 添加收藏按钮
- [ ] 更新 translations.ts 添加翻译键

### 任务 3.2：新用户欢迎弹窗
- [ ] 创建 `src/components/storefront/WelcomeModal.tsx`
- [ ] 实现首次访问检测逻辑
- [ ] 实现优惠码生成和保存
- [ ] 修改 `src/app/page.tsx` 集成 WelcomeModal
- [ ] 添加 2 秒延迟显示
- [ ] 更新 translations.ts 添加翻译键

---

## P1 阶段（续）：性能优化

### 任务 4.1：Next.js Image 组件替换
- [ ] 修改 `src/next.config.ts` 添加图片域名白名单
- [ ] 修改 `src/components/storefront/HomeCarousel.tsx` 使用 next/image
- [ ] 修改 `src/app/page.tsx` 使用 next/image
- [ ] 修改 `src/app/cart/page.tsx` 使用 next/image
- [ ] 修改 `src/app/product/[id]/page.tsx` 使用 next/image

### 任务 4.2：骨架屏加载状态
- [ ] 修改 `src/app/page.tsx`
- [ ] 添加 Skeleton 组件导入
- [ ] 添加 loading 状态
- [ ] 实现骨架屏条件渲染
- [ ] 验证骨架屏显示正常

### 任务 4.3：路由懒加载（可选）
- [ ] 对 EnhancedCheckoutModal 使用 dynamic import
- [ ] 对 AuthModal 使用 dynamic import

---

## 任务依赖关系图

```
任务 1.1 (暗色模式)
    ↓
任务 1.2 (轮播动效)
任务 1.3 (卡片动效)
    ↓
任务 2.1 (限时标签)
任务 2.2 (销量动态)
任务 2.3 (热搜词)
任务 2.4 (分享功能) ──→ 任务 3.1 (收藏功能)
    ↓                           ↓
任务 4.1 (图片优化) ←─────────────────┘
    ↓
任务 4.2 (骨架屏)
    ↓
任务 3.2 (欢迎弹窗)
```

---

## 预期工时估算

| 阶段 | 任务数 | 预计工时 |
|------|--------|---------|
| P0 核心体验 | 3 | 2-3 小时 |
| P1 内容呈现 | 4 | 3-4 小时 |
| P2 用户留存 | 2 | 2-3 小时 |
| P1 性能优化 | 3 | 2-3 小时 |
| **总计** | **12** | **9-13 小时** |
