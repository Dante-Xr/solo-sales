/**
 * ============================================
 * 搜索结果页面
 * ============================================
 * 功能说明：
 *   - 搜索商品
 *   - 展示搜索结果
 *   - 商品添加到购物车
 * ============================================
 * 2026-04-13: 迁移到 next-intl 国际化方案
 */

"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter, Link } from "@/i18n/navigation"
import { useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, ShoppingCart, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/stores/useCartStore"
import { useTranslations, useLocale } from "next-intl"
import { useTheme } from "next-themes"

interface SearchProduct {
  id: string
  name: string
  price: number
  originalPrice: number
  image: string
  sales: number
}

const MOCK_PRODUCTS: SearchProduct[] = [
  {
    id: "prod_mock_001",
    name: "TikTok爆款便携加湿器 | 带RGB氛围灯",
    price: 29.99,
    originalPrice: 49.99,
    image: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&q=80&w=1000",
    sales: 1580,
  },
  {
    id: "prod_mock_002",
    name: "网红发光手机壳 | 磁吸充电",
    price: 19.99,
    originalPrice: 29.99,
    image: "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&q=80&w=1000",
    sales: 2340,
  },
  {
    id: "prod_mock_003",
    name: "蓝牙无线运动耳机 | 防汗降噪",
    price: 39.99,
    originalPrice: 59.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000",
    sales: 892,
  },
  {
    id: "prod_mock_004",
    name: "迷你便携投影仪 | 家用高清",
    price: 89.99,
    originalPrice: 129.99,
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1000",
    sales: 456,
  },
  {
    id: "prod_mock_005",
    name: "智能手表 GPS 心率监测",
    price: 59.99,
    originalPrice: 99.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000",
    sales: 1203,
  },
]

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations('search')
  const locale = useLocale()
  const isZh = locale === "zh"
  const { theme, setTheme } = useTheme()
  const { cartCount, addToCart } = useCartStore()

  const query = searchParams.get("q") || ""
  const [searchInput, setSearchInput] = useState(query)
  const [results, setResults] = useState<SearchProduct[]>([])
  const [loading, setLoading] = useState(true)

  const navItems = [
    { labelKey: "nav.home", href: `/${locale}` },
    { labelKey: "nav.shop", href: `/${locale}/products` },
    { labelKey: "nav.about", href: `/${locale}/about` },
    { labelKey: "nav.contact", href: `/${locale}/contact` },
  ]

  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    const filtered = MOCK_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchQuery.toLowerCase().includes("#trending") ||
      searchQuery.toLowerCase().includes("#flashsale") ||
      searchQuery.toLowerCase().includes("#viral") ||
      searchQuery.toLowerCase().includes("#网红") ||
      searchQuery.toLowerCase().includes("#限时")
    )
    setResults(filtered)
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true)
      performSearch(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, performSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/${locale}/search?q=${encodeURIComponent(searchInput)}`)
  }

  const handleAddToCart = (product: SearchProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[1440px] mx-auto relative">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="px-4 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link href={`/${locale}`} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <span className="text-xl font-bold text-foreground hidden sm:block">SoloSales</span>
                </Link>
                <nav className="hidden lg:flex items-center gap-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t(item.labelKey)}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex-1 max-w-xl px-8 hidden lg:block">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="search"
                    placeholder={t('searchPlaceholder')}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pr-12"
                  />
                  <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0">
                    <Search className="w-5 h-5" />
                  </Button>
                </form>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? "☀️" : "🌙"}
                </Button>
                <Button variant="ghost" size="icon" className="relative" onClick={() => router.push(`/${locale}/cart`)}>
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <div className="flex items-center gap-4 mb-6 lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-bold">
              {query ? `"${query}" ${t('searchResults')}` : t('allProducts')}
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold">
              {query ? `"${query}" ${t('searchResults')}` : t('allProducts')}
            </h1>
            {!loading && (
              <span className="text-muted-foreground">
                {results.length} {t('productsFound')}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-muted-foreground text-lg">{t('searching')}</div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <div className="text-muted-foreground mb-4 text-lg">
                {t('noProductsFound')}
              </div>
              <Button variant="outline" onClick={() => router.push(`/${locale}`)}>
                {t('backToHome')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/${locale}/product/${product.id}`)}>
                  <div className="relative aspect-square bg-muted">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-red-600 dark:text-red-500">${product.price}</span>
                      <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToCart(product)
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {t('addToCart')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/${locale}/product/${product.id}`)
                        }}
                      >
                        {t('details')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function SearchLoading() {
  const t = useTranslations('search')
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
      <div className="text-muted-foreground text-lg">{t('loading')}</div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchPageContent />
    </Suspense>
  )
}