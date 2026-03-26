# TikTok独立站优化 - 代码执行规格文档

> 生成日期：2026-03-23
> 依据：TikTok独立站优化报告.md & TikTok独立站代码修改计划.md

---

## 一、概述

本文档详细规定了在 SoloSales Shop 项目中实施 TikTok 风格优化的具体代码变更。每个任务包含：修改文件清单、代码变更详情、预期效果和验证方法。

---

## 二、P0 阶段：核心体验改造

### 2.1 任务 1.1：暗色模式支持

#### 修改文件清单
- `src/app/globals.css` - 完善 dark 主题变量
- `src/app/layout.tsx` - 添加主题 Provider

#### 代码变更规格

**globals.css 变更**：
```css
.dark {
  --background: oklch(0.11 0.015 285);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.18 0.015 285);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.18 0.015 285);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.92 0.015 285);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.25 0.015 285);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.25 0.015 285);
  --muted-foreground: oklch(0.62 0 0);
  --accent: oklch(0.25 0.015 285);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.65 0.25 25);
  --border: oklch(0.28 0.015 285);
  --input: oklch(0.28 0.015 285);
  --ring: oklch(0.62 0 0);
}
```

**layout.tsx 变更**：
```tsx
// 添加 next-themes 的 ThemeProvider
import { ThemeProvider } from "next-themes"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <LanguageProvider>
              <CartProvider>
                <TooltipProvider>{children}</TooltipProvider>
              </CartProvider>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

#### 预期效果
- 用户可在页面顶部切换深色/浅色主题
- 所有组件自动适配主题变化
- 主题偏好保存到 localStorage

#### 验证方法
1. 打开首页，点击右上角主题切换按钮
2. 检查所有组件（导航栏、商品卡片、按钮等）是否正确响应主题变化
3. 刷新页面，确认主题偏好已保存

---

### 2.2 任务 1.2：轮播组件动效升级

#### 修改文件清单
- `src/components/storefront/HomeCarousel.tsx`

#### 代码变更规格

**HomeCarousel.tsx 变更**：

1. 添加 currentIndex 状态：
```tsx
const [currentIndex, setCurrentIndex] = useState(0)
```

2. 在 useEffect 中添加 onSelect 监听：
```tsx
React.useEffect(() => {
  if (!embla) return

  const onSelect = () => {
    setCurrentIndex(embla.selectedScrollSnap())
  }

  embla.on('select', onSelect)
  startTimer()

  return () => {
    embla.off('select', onSelect)
    stopTimer()
  }
}, [embla, startTimer, stopTimer])
```

3. 替换底部数字计时器为圆点指示器：
```tsx
{/* 替换原有的 <div className="absolute bottom-2 left-1/2..."> */}
<div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
  {FEATURED_PRODUCTS.map((_, i) => (
    <div
      key={i}
      className={`h-1 rounded-full transition-all duration-300 ${
        i === currentIndex ? 'w-6 bg-white' : 'w-1 bg-white/50'
      }`}
    />
  ))}
</div>
```

4. 移除原有的数字计时器显示 div

#### 预期效果
- 轮播底部显示3个圆点指示器
- 当前激活的圆点宽度更大（w-6），其他为小圆点（w-1）
- 切换时有平滑的宽度动画过渡

#### 验证方法
1. 观察轮播图底部是否有3个圆点
2. 手动点击左右箭头，验证圆点是否正确反映当前位置
3. 等待10秒自动切换，验证圆点是否同步更新

---

### 2.3 任务 1.3：商品卡片悬浮动效

#### 修改文件清单
- `src/app/page.tsx`

#### 代码变更规格

**page.tsx 商品卡片部分变更**：

找到 `<Card key={product.id} ...>` 组件，在 className 中添加动效类：

```tsx
<Card
  key={product.id}
  className="cursor-pointer overflow-hidden flex flex-col transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
  onClick={() => router.push(`/product/${product.id}`)}
>
```

#### 预期效果
- 鼠标悬浮时卡片轻微放大并增加阴影
- 点击时卡片轻微缩小提供按压反馈
- 动画过渡平滑，持续200ms

#### 验证方法
1. 将鼠标悬浮在商品卡片上，观察是否有放大和阴影效果
2. 点击卡片，观察是否有按压缩小效果

---

## 三、P1 阶段：内容呈现升级

### 3.1 任务 2.1：限时特惠悬浮标签

#### 修改文件清单
- `src/components/storefront/HomeCarousel.tsx`

#### 代码变更规格

在商品图片上添加 Badge 组件：

```tsx
<CardContent className="p-0 relative w-full h-full">
  <img src={product.image} alt={product.name} className="object-cover w-full h-full" />

  {/* 新增：限时特惠标签 */}
  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
    🔥 {t("product.flashSale")}
  </div>

  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3">
    {/* ... 现有内容 ... */}
  </div>
</CardContent>
```

需要在 translations.ts 中添加新的翻译键：
```ts
product: {
  flashSale: { zh: "限时特惠", en: "FLASH SALE" },
  // ... 现有内容 ...
}
```

#### 预期效果
- 轮播卡片右上角显示红色渐变的"限时特惠"标签
- 标签有脉冲动画效果吸引注意力
- 中英文根据语言设置切换

#### 验证方法
1. 查看轮播卡片右上角是否有"限时特惠"标签
2. 切换语言，验证标签文字是否变化
3. 观察标签是否有脉冲动画

---

### 3.2 任务 2.2：销量实时跳动动画

#### 修改文件清单
- `src/app/page.tsx`
- `src/i18n/translations.ts`

#### 代码变更规格

**1. 在 FEATURED_PRODUCTS 中添加 mock 数据**：

```tsx
export const FEATURED_PRODUCTS = [
  {
    id: "prod_mock_001",
    name: "TikTok爆款便携加湿器 | 带RGB氛围灯",
    price: 29.99,
    originalPrice: 49.99,
    image: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&q=80&w=1000",
    sales: 1580,  // 新增：已售数量
  },
  // ... 其他商品类似
]
```

**2. 在商品卡片中添加观看人数和已售数量**：

```tsx
<div className="flex items-center space-x-1 text-yellow-500">
  {/* 新增：观看人数 */}
  <span className="text-xs text-gray-400 ml-2">
    👀 {Math.floor(Math.random() * 100) + 50} {isZh ? "人正在看" : "watching"}
  </span>
</div>

{/* 在价格下方添加已售数量 */}
<div className="flex items-center space-x-1 mt-1">
  <span className="text-xs text-gray-500">
    {isZh ? "已售" : "Sold"} {product.sales + Math.floor(Math.random() * 50)}
  </span>
</div>
```

#### 预期效果
- 商品卡片显示"XX人正在看"的动态数字
- 价格下方显示"已售 XXX"的销量信息
- 数字每30秒自动更新

#### 验证方法
1. 查看商品卡片是否显示观看人数和已售数量
2. 等待30秒观察数字是否更新
3. 切换语言验证中英文正确显示

---

### 3.3 任务 2.3：搜索框热搜词增强

#### 修改文件清单
- `src/components/storefront/SearchBox.tsx`
- `src/i18n/translations.ts`

#### 代码变更规格

**SearchBox.tsx 变更**：

1. 添加热搜词数组和状态：
```tsx
const hotSearchTerms = {
  zh: ["#网红爆款", "#限时秒杀", "#抖音同款", "#ins风"],
  en: ["#trending", "#flashsale", "#viral", "#mustbuy"]
}

const [hotTerms, setHotTerms] = useState<string[]>([])
const [showHotTerms, setShowHotTerms] = useState(false)
```

2. 在 useEffect 中初始化热搜词：
```tsx
useEffect(() => {
  setHotTerms(isZh ? hotSearchTerms.zh : hotSearchTerms.en)
}, [isZh])
```

3. 在搜索历史下方添加热搜词入口：
```tsx
{showHistory && (
  <>
    {/* 现有搜索历史代码 */}

    {/* 新增：热搜词区域 */}
    <div className="border-t mt-1">
      <div className="px-3 py-2 text-sm text-gray-600 flex items-center gap-2">
        <span>🔥</span>
        <span>{t("nav.hotSearch")}</span>
      </div>
      <div className="flex flex-wrap gap-2 px-3 pb-2">
        {hotTerms.map((term, index) => (
          <button
            key={index}
            onClick={() => selectFromHistory(term)}
            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  </>
)}
```

4. 添加翻译键：
```ts
nav: {
  hotSearch: { zh: "热搜", en: "Hot Search" },
  // ... 现有内容 ...
}
```

#### 预期效果
- 搜索框获得焦点时显示热搜词快捷入口
- 点击热搜词直接填充搜索框并执行搜索
- 切换语言后热搜词相应变化

#### 验证方法
1. 点击搜索框，检查是否显示热搜词
2. 点击热搜词，验证是否执行搜索
3. 切换语言后检查热搜词是否变化

---

### 3.4 任务 2.4：一键分享功能

#### 修改文件清单
- `src/app/product/[id]/page.tsx`
- `src/i18n/translations.ts`

#### 代码变更规格

**1. 添加分享按钮和功能**：

```tsx
import { Share2, Copy, Check } from 'lucide-react'
import { useState } from 'react'

// 在 ProductDetailPage 组件中添加
const [copied, setCopied] = useState(false)

const handleShare = async () => {
  const shareData = {
    title: detailProduct.name,
    text: isZh
      ? "发现一个超赞的商品！快来看看 👇"
      : "Check out this amazing product! 👇",
    url: window.location.href,
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  } catch (err) {
    console.log('Share cancelled or failed')
  }
}
```

**2. 在底部操作栏添加分享按钮**：

```tsx
<div className="fixed bottom-0 w-full max-w-md bg-white border-t p-4 flex gap-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-50">
  {/* 分享按钮 - 新增 */}
  <Button
    variant="outline"
    size="lg"
    className="rounded-full border-gray-300"
    onClick={handleShare}
  >
    {copied ? (
      <Check className="w-5 h-5 mr-2 text-green-500" />
    ) : (
      <Share2 className="w-5 h-5 mr-2" />
    )}
    {copied
      ? (isZh ? "已复制" : "Copied!")
      : (isZh ? "分享" : "Share")}
  </Button>

  {/* 现有按钮保持不变 */}
  <Button variant="outline" size="lg" className="flex-1 rounded-full..." onClick={handleAddToCart}>
    {isZh ? "加入购物车" : "Add to Cart"}
  </Button>
  <Button size="lg" className="flex-1 rounded-full..." onClick={() => setIsCheckoutOpen(true)}>
    {isZh ? "立即购买" : "Buy Now"}
  </Button>
</div>
```

**3. 添加翻译键**：
```ts
product: {
  share: { zh: "分享", en: "Share" },
  shareSuccess: { zh: "链接已复制", en: "Link copied!" },
  // ... 现有内容 ...
}
```

#### 预期效果
- 商品详情页底部显示分享按钮
- 点击分享按钮触发系统分享面板（移动端）
- 桌面端或分享失败时复制链接到剪贴板
- 复制成功显示"已复制"反馈

#### 验证方法
1. 在商品详情页检查分享按钮是否存在
2. 点击分享按钮，验证行为是否符合预期
3. 检查中英文切换是否正确

---

## 四、P2 阶段：用户留存体系

### 4.1 任务 3.1：商品收藏/心愿单功能

#### 修改文件清单
- `src/context/WishlistContext.tsx`（新建）
- `src/app/page.tsx`
- `src/app/product/[id]/page.tsx`
- `src/components/storefront/UserMenu.tsx`
- `src/i18n/translations.ts`

#### 代码变更规格

**1. 创建 WishlistContext.tsx**：

```tsx
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface WishlistContextType {
  wishlist: string[]
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (productId: string) => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

const WISHLIST_STORAGE_KEY = "solo_wishlist"

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY)
      if (saved) {
        setWishlist(JSON.parse(saved))
      }
    } catch (e) {
      console.error("Failed to load wishlist", e)
    }
  }, [mounted])

  const addToWishlist = (productId: string) => {
    const newWishlist = [...wishlist, productId]
    setWishlist(newWishlist)
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(newWishlist))
  }

  const removeFromWishlist = (productId: string) => {
    const newWishlist = wishlist.filter(id => id !== productId)
    setWishlist(newWishlist)
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(newWishlist))
  }

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId)
  }

  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId)
    } else {
      addToWishlist(productId)
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
```

**2. 在 layout.tsx 中添加 WishlistProvider**

**3. 在商品详情页添加收藏按钮**：

```tsx
import { Heart } from 'lucide-react'
import { useWishlist } from "@/context/WishlistContext"

const { isInWishlist, toggleWishlist } = useWishlist()
const inWishlist = isInWishlist(product.id)

const handleToggleWishlist = () => {
  toggleWishlist(product.id)
}

// 在底部操作栏添加收藏按钮
<Button
  variant={inWishlist ? "default" : "outline"}
  size="icon"
  className={`rounded-full ${inWishlist ? 'bg-red-500 hover:bg-red-600' : ''}`}
  onClick={handleToggleWishlist}
>
  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-white text-white' : ''}`} />
</Button>
```

**4. 添加翻译键**：
```ts
product: {
  addToWishlist: { zh: "收藏", en: "Add to Wishlist" },
  removeFromWishlist: { zh: "取消收藏", en: "Remove from Wishlist" },
  // ... 现有内容 ...
}
```

#### 预期效果
- 商品详情页显示收藏按钮（心形图标）
- 点击按钮切换收藏状态
- 收藏数据保存到 localStorage
- 已收藏商品显示实心红心

#### 验证方法
1. 在商品详情页点击收藏按钮
2. 检查 localStorage 中是否保存了 wishlist 数据
3. 刷新页面验证收藏状态是否持久化

---

### 4.2 任务 3.2：新用户欢迎弹窗

#### 修改文件清单
- `src/components/storefront/WelcomeModal.tsx`（新建）
- `src/app/page.tsx`
- `src/i18n/translations.ts`

#### 代码变更规格

**1. 创建 WelcomeModal.tsx**：

```tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Gift } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

interface WelcomeModalProps {
  onClose: () => void
  onClaim: (couponCode: string) => void
}

export function WelcomeModal({ onClose, onClaim }: WelcomeModalProps) {
  const { language } = useLanguage()
  const isZh = language === "zh"

  const handleClaim = () => {
    const couponCode = "NEWUSER5"
    localStorage.setItem("solo_new_user_coupon", couponCode)
    localStorage.setItem("solo_coupon_claimed", "true")
    onClaim(couponCode)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 顶部装饰 */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 pt-10 text-center">
          <div className="text-5xl mb-2">🎁</div>
          <h2 className="text-2xl font-bold text-white">
            {isZh ? "新人专属优惠" : "Welcome Gift"}
          </h2>
        </div>

        {/* 内容 */}
        <div className="p-6 text-center">
          <div className="text-4xl font-black text-red-500 mb-2">$5 OFF</div>
          <p className="text-gray-600 mb-6">
            {isZh
              ? "首单立减5美元，全场通用"
              : "$5 off your first order, valid on all products"}
          </p>

          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <div className="text-xs text-gray-500 mb-1">
              {isZh ? "优惠码" : "Coupon Code"}
            </div>
            <div className="text-lg font-mono font-bold">NEWUSER5</div>
          </div>

          <Button
            onClick={handleClaim}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-6 text-lg font-bold rounded-xl"
          >
            {isZh ? "立即领取" : "Claim Now"}
          </Button>

          <p className="text-xs text-gray-400 mt-4">
            {isZh
              ? "* 有效期30天，不可与其他优惠叠加"
              : "* Valid for 30 days, cannot be combined with other offers"}
          </p>
        </div>
      </div>
    </div>
  )
}
```

**2. 在 page.tsx 中集成 WelcomeModal**：

```tsx
import { WelcomeModal } from "@/components/storefront/WelcomeModal"
import { useState, useEffect } from "react"

export default function Storefront() {
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const hasVisited = localStorage.getItem("solo_has_visited")
    const couponClaimed = localStorage.getItem("solo_coupon_claimed")

    if (!hasVisited || !couponClaimed) {
      const timer = setTimeout(() => {
        setShowWelcome(true)
        localStorage.setItem("solo_has_visited", "true")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClaimCoupon = (code: string) => {
    console.log("Coupon claimed:", code)
  }

  return (
    <>
      {/* ... 现有代码 ... */}

      {showWelcome && (
        <WelcomeModal
          onClose={() => setShowWelcome(false)}
          onClaim={handleClaimCoupon}
        />
      )}
    </>
  )
}
```

#### 预期效果
- 首次访问用户2秒后显示欢迎弹窗
- 显示$5首单优惠信息
- 点击领取后优惠码保存到 localStorage
- 同一用户不会再次显示弹窗

#### 验证方法
1. 清除 localStorage 中的相关数据
2. 刷新页面，等待2秒检查弹窗是否显示
3. 点击"立即领取"，验证 localStorage 是否保存了优惠码
4. 刷新页面，确认弹窗不再显示

---

## 五、P1 阶段（续）：性能优化

### 5.1 任务 4.1：Next.js Image 组件替换

#### 修改文件清单
- `src/components/storefront/HomeCarousel.tsx`
- `src/app/page.tsx`
- `src/app/cart/page.tsx`
- `src/app/product/[id]/page.tsx`
- `src/next.config.ts`

#### 代码变更规格

**1. 在 next.config.ts 中配置远端图片域名**：

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
```

**2. 替换 HomeCarousel.tsx 中的 img 标签**：

```tsx
import Image from "next/image"

// 将
// <img src={product.image} alt={product.name} className="object-cover w-full h-full" />

// 替换为
<Image
  src={product.image}
  alt={product.name}
  fill
  className="object-cover"
  priority={true}  // 首页轮播使用 priority
/>
```

**3. 替换其他页面中的 img 标签**，模式相同

#### 预期效果
- 图片自动优化（WebP格式、响应式大小）
- 减少 CLS（Cumulative Layout Shift）
- 首屏图片优先加载

#### 验证方法
1. 打开浏览器 DevTools Network 面板
2. 检查图片请求是否为 WebP 格式
3. 刷新页面观察是否有布局跳动

---

### 5.2 任务 4.2：骨架屏加载状态

#### 修改文件清单
- `src/app/page.tsx`
- `src/components/ui/skeleton.tsx`（使用现有 shadcn skeleton）

#### 代码变更规格

**page.tsx 变更**：

```tsx
// 导入 skeleton
import { Skeleton } from "@/components/ui/skeleton"

// 添加加载状态
const [loading, setLoading] = useState(true)

// 模拟数据加载（实际项目中替换为真实 API 调用）
useEffect(() => {
  const timer = setTimeout(() => setLoading(false), 1000)
  return () => clearTimeout(timer)
}, [])

// 在商品列表位置使用条件渲染
{loading ? (
  <div className="grid grid-cols-2 gap-4">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="space-y-2">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    ))}
  </div>
) : (
  <div className="grid grid-cols-2 gap-4">
    {FEATURED_PRODUCTS.map(product => (
      <Card key={product.id} ...>
        {/* ... 现有卡片内容 ... */}
      </Card>
    ))}
  </div>
)}
```

#### 预期效果
- 页面加载时显示骨架屏占位
- 骨架屏布局与实际内容一致
- 数据加载完成后平滑过渡到真实内容

#### 验证方法
1. 刷新页面，观察是否有骨架屏闪烁
2. 验证骨架屏布局与实际商品卡片一致
3. 确认加载完成后内容正常显示

---

## 六、任务完成验证清单

### P0 阶段
- [ ] 暗色模式 CSS 变量配置完整
- [ ] 主题切换按钮功能正常
- [ ] 轮播圆点指示器显示正确
- [ ] 圆点动画平滑过渡
- [ ] 商品卡片悬浮动效生效

### P1 阶段
- [ ] 限时特惠标签显示
- [ ] 观看人数动态更新
- [ ] 已售数量显示
- [ ] 热搜词搜索功能
- [ ] 分享按钮正常工作
- [ ] 图片使用 next/image 优化

### P2 阶段
- [ ] 收藏按钮添加/移除正常
- [ ] 收藏数据持久化
- [ ] 新用户弹窗首次显示
- [ ] 优惠券领取逻辑

### 性能阶段
- [ ] 骨架屏加载显示
- [ ] 图片加载无布局跳动
- [ ] next/image 配置生效

---

## 七、翻译键汇总

需要在 `src/i18n/translations.ts` 中添加的翻译键：

```ts
product: {
  flashSale: { zh: "限时特惠", en: "FLASH SALE" },
  share: { zh: "分享", en: "Share" },
  shareSuccess: { zh: "链接已复制", en: "Link copied!" },
  addToWishlist: { zh: "收藏", en: "Add to Wishlist" },
  watching: { zh: "人正在看", en: "watching" },
  sold: { zh: "已售", en: "Sold" },
}

nav: {
  hotSearch: { zh: "热搜", en: "Hot Search" },
}

welcome: {
  title: { zh: "新人专属优惠", en: "Welcome Gift" },
  discount: { zh: "首单立减5美元，全场通用", en: "$5 off your first order" },
  claim: { zh: "立即领取", en: "Claim Now" },
  couponCode: { zh: "优惠码", en: "Coupon Code" },
  validity: { zh: "* 有效期30天，不可与其他优惠叠加", en: "* Valid for 30 days" },
}
```
