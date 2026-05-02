/**
 * 修改时间：2026-05-02 21:09:54 +08:00
 * 修改内容：兼容 featured 产品标准响应 success/data，保留旧响应格式回退。
 * 修改模型：gpt-5.5
 */
"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Sun, Moon, AlertTriangle } from "lucide-react"
import { HomeCarouselClient as HomeCarousel, ProductItem } from "@/components/storefront/HomeCarouselClient"
import { SearchBoxClient as SearchBox } from "@/components/storefront/SearchBoxClient"
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
  const [products, setProducts] = useState<ProductItem[]>([])

  const getRandomViewers = useCallback(() => Math.floor(Math.random() * 100) + 50, [])
  const getRandomSold = useCallback(() => Math.floor(Math.random() * 50), [])

  useEffect(() => {
    fetch("/api/products/featured")
      .then(res => res.json())
      .then(data => {
        // featured route 已标准化；保留旧顶层 products 兼容，避免演示页因响应升级空白。
        const featured = data?.success ? data.data : data
        if (featured?.products) {
          setProducts(featured.products)
        }
      })
      .catch(console.error)
  }, [])

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

  const handleAddToCart = (product: ProductItem, e: React.MouseEvent) => {
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
        <div className="bg-yellow-500/90 text-yellow-950 text-center py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium">
          <AlertTriangle className="w-4 h-4" />
          {t('common.loading')}
        </div>

        <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-50">
          <h1 className="text-xl font-bold tracking-tight">{t('nav.shopName')}</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title={theme === "dark" ? "Switch to Light" : "切换到暗色"}>
              {theme === "dark" ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
            </Button>
            <LanguageSwitcher />
            <UserMenu />
            <Button variant="ghost" size="icon" className="relative" onClick={() => router.push('/cart')}>
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-brand text-brand-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </header>

        <div className="overflow-y-auto">
          <HomeCarousel products={products} />

          <div className="px-4 pb-2">
            <SearchBox onSearch={(query) => console.log("Demo Search:", query)} />
          </div>

          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">{t('nav.allProducts')}</h2>
            <div className="grid grid-cols-2 gap-4">
              {products.map(product => (
                <Card
                  key={product.id}
                  className="cursor-pointer overflow-hidden flex flex-col transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  onClick={() => router.push(`/product/${product.id}`)}
                >
                  <div className="aspect-square relative">
                    <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>👀</span>
                      <span>{viewers}</span>
                    </div>
                  </div>
                  <CardContent className="p-3 flex-1 flex flex-col justify-between">
                    <h3 className="text-sm font-medium line-clamp-2 mb-1">{product.name}</h3>
                    <div className="text-xs text-muted-foreground mb-2">
                      {t('product.sold')} {product.sales + soldRandom}
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-lg font-bold text-price">${product.price}</span>
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
