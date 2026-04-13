"use client"

// 2026-03-23: 演示页面 - 供外部人员体验核心电商功能
// 2026-04-13: 更新为使用 next-intl 国际化

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Sun, Moon, AlertTriangle } from "lucide-react"
import { HomeCarousel, FEATURED_PRODUCTS } from "@/components/storefront/HomeCarousel"
import { SearchBox } from "@/components/storefront/SearchBox"
import { UserMenu } from "@/components/storefront/UserMenu"
import { LanguageSwitcher } from "@/components/storefront/LanguageSwitcher"
import { WelcomeModal } from "@/components/storefront/WelcomeModal"
import { useCartStore } from "@/stores/useCartStore"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"

export default function DemoPage() {
  const router = useRouter()
  const t = useTranslations()
  const { cartCount, addToCart } = useCartStore()
  const { theme, setTheme } = useTheme()
  const [viewers, setViewers] = useState(0)
  const [soldRandom, setSoldRandom] = useState(0)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showDemoNotice, setShowDemoNotice] = useState(false)

  const getRandomViewers = useCallback(() => Math.floor(Math.random() * 100) + 50, [])
  const getRandomSold = useCallback(() => Math.floor(Math.random() * 50), [])

  useEffect(() => {
    setViewers(getRandomViewers())
    setSoldRandom(getRandomSold())
    const viewerInterval = setInterval(() => {
      setViewers(getRandomViewers())
    }, 30000)

    const hasVisited = localStorage.getItem("demo_has_visited")
    if (!hasVisited) {
      const timer = setTimeout(() => {
        setShowWelcome(true)
        localStorage.setItem("demo_has_visited", "true")
      }, 2000)
      return () => {
        clearInterval(viewerInterval)
        clearTimeout(timer)
      }
    }

    return () => clearInterval(viewerInterval)
  }, [getRandomSold, getRandomViewers])

  const handleClaimCoupon = (code: string) => {
    console.log("Demo coupon claimed:", code)
  }

  const handleCheckout = () => {
    setShowDemoNotice(true)
  }

  const handleAddToCart = (product: typeof FEATURED_PRODUCTS[0], e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
  }

  return (
    <div className="min-h-screen bg-muted flex justify-center">
      <main className="w-full max-w-md bg-card text-card-foreground min-h-screen shadow-xl flex flex-col relative pb-16">
        {/* 演示模式顶部横幅 */}
        <div className="bg-yellow-500/90 text-yellow-950 text-center py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium">
          <AlertTriangle className="w-4 h-4" />
          {t('common.loading')}
        </div>

        <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-50">
          <h1 className="text-xl font-bold tracking-tight">{t('nav.shopName')}</h1>
          <div className="flex items-center gap-1">
            {/* 暗色模式切换按钮 */}
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title={theme === "dark" ? "Switch to Light" : "切换到暗色"}>
              {theme === "dark" ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
            </Button>
            {/* 语言切换按钮 */}
            <LanguageSwitcher />
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
          {/* 首页轮播图组件 */}
          <HomeCarousel />

          {/* 商品搜索框 */}
          <div className="px-4 pb-2">
            <SearchBox onSearch={(query) => console.log("Demo Search:", query)} />
          </div>

          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">{t('nav.allProducts')}</h2>
            <div className="grid grid-cols-2 gap-4">
              {FEATURED_PRODUCTS.map(product => (
                <Card
                  key={product.id}
                  className="cursor-pointer overflow-hidden flex flex-col transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  onClick={() => router.push(`/product/${product.id}`)}
                >
                  <div className="aspect-square relative">
                    <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
                    {/* 正在观看人数 */}
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>👀</span>
                      <span>{viewers}</span>
                    </div>
                  </div>
                  <CardContent className="p-3 flex-1 flex flex-col justify-between">
                    <h3 className="text-sm font-medium line-clamp-2 mb-1">{product.name}</h3>
                    {/* 已售数量 */}
                    <div className="text-xs text-muted-foreground mb-2">
                      {t('product.sold')} {product.sales + soldRandom}
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-lg font-bold text-red-600 dark:text-red-500">${product.price}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={(e) => handleAddToCart(product, e)}
                      >
                        {t('cart.addToCart')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* 底部演示说明 */}
        <div className="fixed bottom-0 w-full max-w-md bg-card border-t p-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{cartCount}</span> {t('common.order')}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/cart')}
              >
                {t('cart.title')}
              </Button>
              <Button
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950"
                onClick={handleCheckout}
              >
                {t('cart.checkout')}
              </Button>
            </div>
          </div>
        </div>

        {/* 演示模式提示弹窗 */}
        {showDemoNotice && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
            <div className="bg-card rounded-xl p-6 max-w-sm w-full text-center">
              <div className="text-5xl mb-4">🎪</div>
              <h3 className="text-xl font-bold mb-2">
                {t('nav.shopName')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('common.loading')}
              </p>
              <Button onClick={() => setShowDemoNotice(false)} className="w-full">
                {t('common.confirm')}
              </Button>
            </div>
          </div>
        )}

        {/* 新用户欢迎弹窗 */}
        {showWelcome && (
          <WelcomeModal
            onClose={() => setShowWelcome(false)}
            onClaim={handleClaimCoupon}
          />
        )}
      </main>
    </div>
  )
}
