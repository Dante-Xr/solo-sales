"use client"

// 2026-03-24: 使用 Next.js dynamic 动态导入 WelcomeModal，首屏不加载此组件
// 优化目的：减少首屏 JS bundle 体积，提升首次加载速度
import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Globe, Sun, Moon } from "lucide-react"
import { HomeCarousel, FEATURED_PRODUCTS } from "@/components/storefront/HomeCarousel"
import { SearchBox } from "@/components/storefront/SearchBox"
import { UserMenu } from "@/components/storefront/UserMenu"
import { useCart } from "@/context/CartContext"
import { useLanguage } from "@/context/LanguageContext"
import { useTheme } from "@/components/providers/ThemeProvider"

// 2026-03-24: WelcomeModal 改为动态导入，不参与 SSR
// ssr: false - 避免水合问题，loading: null - 加载时无占位
// 注意：WelcomeModal 是命名导出，使用 .then 方式导入
const WelcomeModal = dynamic(
  () => import("@/components/storefront/WelcomeModal").then(mod => mod.WelcomeModal),
  {
    ssr: false,
    loading: () => null
  }
)

export default function Storefront() {
  const router = useRouter()
  const { cartCount } = useCart()
  const { language, toggleLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [viewers, setViewers] = useState(0)
  const [soldRandom, setSoldRandom] = useState(0)
  const [showWelcome, setShowWelcome] = useState(false)

  const getRandomViewers = useCallback(() => Math.floor(Math.random() * 100) + 50, [])
  const getRandomSold = useCallback(() => Math.floor(Math.random() * 50), [])

  useEffect(() => {
    setMounted(true)
    setViewers(getRandomViewers())
    setSoldRandom(getRandomSold())
    const viewerInterval = setInterval(() => {
      setViewers(getRandomViewers())
    }, 30000)

    const hasVisited = localStorage.getItem("solo_has_visited")
    const couponClaimed = localStorage.getItem("solo_coupon_claimed")

    if (!hasVisited || !couponClaimed) {
      const timer = setTimeout(() => {
        setShowWelcome(true)
        localStorage.setItem("solo_has_visited", "true")
      }, 2000)
      return () => {
        clearInterval(viewerInterval)
        clearTimeout(timer)
      }
    }

    return () => clearInterval(viewerInterval)
  }, [])

  const handleClaimCoupon = (code: string) => {
    console.log("Coupon claimed:", code)
  }

  const isZh = language === "zh"

  return (
    <div className="min-h-screen bg-muted flex justify-center">
      <main className="w-full max-w-md bg-card text-card-foreground min-h-screen shadow-xl flex flex-col relative pb-16">
        <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-50">
          <h1 className="text-xl font-bold tracking-tight">{isZh ? "SoloSales Shop" : "SoloSales Shop"}</h1>
          <div className="flex items-center gap-1">
            {/* 暗色模式切换按钮 */}
            {mounted && (
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title={theme === "dark" ? "Switch to Light" : "切换到暗色"}>
                {theme === "dark" ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
              </Button>
            )}
            {/* 语言切换按钮 */}
            <Button variant="ghost" size="icon" onClick={toggleLanguage} title={isZh ? "Switch to English" : "切换到中文"}>
              <Globe className="w-5 h-5 text-foreground" />
            </Button>
            {/* 用户菜单 */}
            <UserMenu />
            {/* 购物车 */}
            <Button variant="ghost" size="icon" className="relative" onClick={() => router.push('/cart')}>
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </header>

        <div className="overflow-y-auto">
          {/* 首页轮播图组件：展示热卖商品，每10秒自动切换 */}
          <HomeCarousel />

          {/* 商品搜索框：支持搜索历史记忆功能 */}
          <div className="px-4 pb-2">
            <SearchBox onSearch={(query) => console.log("Search:", query)} />
          </div>

          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">{isZh ? "全部商品" : "All Products"}</h2>
            <div className="grid grid-cols-2 gap-4">
              {FEATURED_PRODUCTS.map(product => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="block"
                  prefetch={true}
                >
                  <Card className="cursor-pointer overflow-hidden flex flex-col transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]">
                    <div className="aspect-square relative">
                      <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" priority={product.id === FEATURED_PRODUCTS[0].id} />
                      {/* 正在观看人数 - 仅客户端渲染 */}
                      {mounted && (
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span>👀</span>
                          <span>{viewers}</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3 flex-1 flex flex-col justify-between">
                      <h3 className="text-sm font-medium line-clamp-2 mb-1">{product.name}</h3>
                      {/* 已售数量 - 仅客户端渲染 */}
                      {mounted && (
                        <div className="text-xs text-muted-foreground mb-2">
                          {isZh ? "已售" : "Sold"} {product.sales + soldRandom}
                        </div>
                      )}
                      <div className="flex items-end space-x-1">
                        <span className="text-lg font-bold text-red-600 dark:text-red-500">${product.price}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 新用户欢迎弹窗 */}
      {showWelcome && (
        <WelcomeModal
          onClose={() => setShowWelcome(false)}
          onClaim={handleClaimCoupon}
        />
      )}
    </div>
  )
}

