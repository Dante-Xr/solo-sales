# TikTok独立站优化 - 实施检查清单

> 生成日期：2026-03-23

---

## 代码修改检查清单

### P0 阶段检查

#### 任务 1.1：暗色模式支持
- [ ] `src/app/globals.css` 已添加完整的 `.dark` 主题变量
- [ ] `src/app/layout.tsx` 已导入并使用 `ThemeProvider`
- [ ] `next-themes` 依赖已安装
- [ ] 所有主题变量（background, foreground, card 等）在 dark 模式下值正确
- [ ] 主题偏好已保存到 localStorage

#### 任务 1.2：轮播组件动效升级
- [ ] `HomeCarousel.tsx` 已导入 `useState` Hook
- [ ] 添加了 `currentIndex` 状态变量
- [ ] `embla.on('select', ...)` 事件监听已添加
- [ ] 数字计时器 `<div className="absolute bottom-2 left-1/2...">` 已移除
- [ ] 新的圆点指示器已添加，包含正确的类和动画
- [ ] 当前索引圆点宽度为 `w-6`，其他为 `w-1`
- [ ] 圆点有 `transition-all duration-300` 动画

#### 任务 1.3：商品卡片悬浮动效
- [ ] `page.tsx` 商品卡片 `Card` 组件已添加 `transition-all duration-200`
- [ ] 已添加 `hover:scale-[1.02]` 类
- [ ] 已添加 `hover:shadow-lg` 类
- [ ] 已添加 `active:scale-[0.98]` 类

---

### P1 阶段检查

#### 任务 2.1：限时特惠悬浮标签
- [ ] `HomeCarousel.tsx` 已导入 `Badge` 组件
- [ ] 商品图片上方已添加限时特惠标签
- [ ] 标签使用 `bg-gradient-to-r from-red-500 to-orange-500`
- [ ] 标签有 `animate-pulse` 动画
- [ ] 标签显示中英文 `t("product.flashSale")`
- [ ] `translations.ts` 已添加 `product.flashSale` 翻译键

#### 任务 2.2：销量实时跳动动画
- [ ] `FEATURED_PRODUCTS` 数组已添加 `sales` 字段
- [ ] 商品卡片显示 `👀 XX人正在看` 动态数字
- [ ] 商品卡片显示 `已售 XXX` 销量信息
- [ ] 数字使用 `Math.floor(Math.random() * 100) + 50` 模拟
- [ ] `translations.ts` 已添加 `product.watching` 和 `product.sold` 翻译键

#### 任务 2.3：搜索框热搜词增强
- [ ] `SearchBox.tsx` 已添加 `hotSearchTerms` 数组
- [ ] 搜索历史区域下方已添加热搜词区域
- [ ] 点击热搜词调用 `selectFromHistory(term)`
- [ ] 热搜词使用 `flex-wrap gap-2` 布局
- [ ] `translations.ts` 已添加 `nav.hotSearch` 翻译键

#### 任务 2.4：一键分享功能
- [ ] `product/[id]/page.tsx` 已导入 `Share2`, `Copy`, `Check` 图标
- [ ] 已添加 `useState` 用于 `copied` 状态
- [ ] `handleShare` 异步函数已实现
- [ ] 支持 `navigator.share` API
- [ ] 降级方案：复制链接到剪贴板已实现
- [ ] 底部操作栏已添加分享按钮
- [ ] 复制成功显示 `已复制`/`Copied!` 反馈
- [ ] `translations.ts` 已添加 `product.share`, `product.shareSuccess` 翻译键

---

### P2 阶段检查

#### 任务 3.1：商品收藏/心愿单功能
- [ ] `WishlistContext.tsx` 文件已创建
- [ ] `WishlistProvider` 组件已实现
- [ ] `useWishlist` Hook 已导出
- [ ] `addToWishlist`, `removeFromWishlist`, `isInWishlist`, `toggleWishlist` 方法已实现
- [ ] localStorage 持久化已实现
- [ ] `layout.tsx` 已添加 `WishlistProvider`
- [ ] 商品详情页已导入并使用 `useWishlist`
- [ ] 收藏按钮使用 Heart 图标
- [ ] 已收藏状态显示实心红心 `fill-white`
- [ ] `translations.ts` 已添加相关翻译键

#### 任务 3.2：新用户欢迎弹窗
- [ ] `WelcomeModal.tsx` 文件已创建
- [ ] 检测 `solo_has_visited` 判断首次访问
- [ ] 2秒延迟显示已实现
- [ ] 显示 $5 OFF 优惠信息
- [ ] 优惠码 `NEWUSER5` 已生成
- [ ] 点击领取保存到 localStorage
- [ ] `page.tsx` 已集成 WelcomeModal
- [ ] `onClose` 和 `onClaim` 回调已正确处理
- [ ] `translations.ts` 已添加 welcome 相关翻译键

---

### P1 阶段（续）检查

#### 任务 4.1：Next.js Image 组件替换
- [ ] `next.config.ts` 已配置 `images.remotePatterns`
- [ ] `images.unsplash.com` 域名已添加
- [ ] `HomeCarousel.tsx` 的 `<img>` 已替换为 `next/image`
- [ ] `fill` 属性已使用
- [ ] `page.tsx` 商品卡片图片已替换
- [ ] `cart/page.tsx` 图片已替换
- [ ] `product/[id]/page.tsx` 图片已替换
- [ ] 轮播图添加了 `priority={true}` 属性

#### 任务 4.2：骨架屏加载状态
- [ ] `page.tsx` 已导入 `Skeleton` 组件
- [ ] `loading` 状态已添加
- [ ] 骨架屏 UI 结构与商品卡片布局一致
- [ ] 条件渲染逻辑已实现
- [ ] 模拟数据加载已完成

---

## 功能验证检查清单

### 界面与交互
- [ ] 首页可正常打开
- [ ] 暗色/浅色模式切换正常
- [ ] 轮播图左右箭头点击正常
- [ ] 轮播图10秒自动切换正常
- [ ] 圆点指示器与当前幻灯片同步
- [ ] 商品卡片悬浮动效正常
- [ ] 限时特惠标签显示并有脉冲动画

### 搜索功能
- [ ] 搜索框可输入文字
- [ ] 搜索历史显示正常
- [ ] 热搜词显示正常
- [ ] 点击热搜词执行搜索
- [ ] 搜索历史可清空

### 商品详情
- [ ] 点击商品卡片进入详情页
- [ ] 商品图片正常显示
- [ ] 分享按钮存在并可点击
- [ ] 复制链接功能正常
- [ ] 收藏按钮存在并可点击
- [ ] 收藏状态切换正常

### 用户体验
- [ ] 新用户首次访问显示欢迎弹窗
- [ ] 优惠码领取功能正常
- [ ] 同一用户不会再次显示欢迎弹窗

### 性能
- [ ] 图片加载使用 next/image
- [ ] 页面加载时显示骨架屏
- [ ] 无布局跳动（CLS = 0）

---

## 代码质量检查

- [ ] 所有新增组件都有中文注释
- [ ] 所有翻译键都在 translations.ts 中定义
- [ ] 没有硬编码的中英文文字
- [ ] 代码遵循项目现有的风格和规范
- [ ] 没有引入新的 console.error 或警告
- [ ] TypeScript 类型检查通过
- [ ] ESLint 检查通过

---

## 文件变更汇总

### 新建文件
- `src/context/WishlistContext.tsx`
- `src/components/storefront/WelcomeModal.tsx`

### 修改文件
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/components/storefront/HomeCarousel.tsx`
- `src/components/storefront/SearchBox.tsx`
- `src/app/product/[id]/page.tsx`
- `src/i18n/translations.ts`
- `src/next.config.ts`
