"use client"

// 2026-03-23: 演示页面 - 供外部人员体验核心电商功能

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Globe, Sun, Moon, AlertTriangle } from "lucide-react"
import { HomeCarousel, FEATURED_PRODUCTS } from "@/components/storefront/HomeCarousel"
import { SearchBox } from "@/components/storefront/SearchBox"
import { UserMenu } from "@/components/storefront/UserMenu"
import { WelcomeModal } from "@/components/storefront/WelcomeModal"
import { useCart } from "@/context/CartContext"
import { useLanguage } from "@/context/LanguageContext"
import { useTheme } from "@/components/providers/ThemeProvider"

export default function DemoPage() {
  const router = useRouter()
  const { cartCount, addToCart } = useCart()
  const { language, toggleLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [viewers, setViewers] = useState(0)
  const [soldRandom, setSoldRandom] = useState(0)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showDemoNotice, setShowDemoNotice] = useState(false)

  const getRandomViewers = useCallback(() => Math.floor(Math.random() * 100) + 50, [])
  const getRandomSold = useCallback(() => Math.floor(Math.random() * 50), [])

  useEffect(() => {
    setMounted(true)
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
  }, [])

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

  const isZh = language === "zh"

  return (
    <div className="min-h-screen bg-muted flex justify-center">
      <main className="w-full max-w-md bg-card text-card-foreground min-h-screen shadow-xl flex flex-col relative pb-16">
        {/* 演示模式顶部横幅 */}
        <div className="bg-yellow-500/90 text-yellow-950 text-center py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium">
          <AlertTriangle className="w-4 h-4" />
          {isZh ? "演示模式 - 仅供体验，不支持真实下单" : "Demo Mode - For Demo Only"}
        </div>

        <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-50">
          <h1 className="text-xl font-bold tracking-tight">SoloSales Shop</h1>
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
          {/* 首页轮播图组件 */}
          <HomeCarousel />

          {/* 商品搜索框 */}
          <div className="px-4 pb-2">
            <SearchBox onSearch={(query) => console.log("Demo Search:", query)} />
          </div>

          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">{isZh ? "全部商品" : "All Products"}</h2>
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
                    {mounted && (
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span>👀</span>
                        <span>{viewers}</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 flex-1 flex flex-col justify-between">
                    <h3 className="text-sm font-medium line-clamp-2 mb-1">{product.name}</h3>
                    {/* 已售数量 */}
                    {mounted && (
                      <div className="text-xs text-muted-foreground mb-2">
                        {isZh ? "已售" : "Sold"} {product.sales + soldRandom}
                      </div>
                    )}
                    <div className="flex items-end justify-between">
                      <span className="text-lg font-bold text-red-600 dark:text-red-500">${product.price}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={(e) => handleAddToCart(product, e)}
                      >
                        {isZh ? "加购" : "Add"}
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
              <span className="font-medium text-foreground">{cartCount}</span> {isZh ? "件商品" : "items"}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/cart')}
              >
                {isZh ? "查看购物车" : "View Cart"}
              </Button>
              <Button
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950"
                onClick={handleCheckout}
              >
                {isZh ? "演示结账" : "Demo Checkout"}
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
                {isZh ? "演示环境" : "Demo Environment"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isZh
                  ? "这是演示页面，不支持真实下单交易。如需完整功能，请联系开发者。"
                  : "This is a demo page. No real orders can be placed. Contact the developer for full features."}
              </p>
              <Button onClick={() => setShowDemoNotice(false)} className="w-full">
                {isZh ? "我知道了" : "Got it"}
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
