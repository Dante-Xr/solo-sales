"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { useLanguage } from "@/context/LanguageContext"

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
  const { cartCount, addToCart } = useCart()
  const { language } = useLanguage()
  const isZh = language === "zh"

  const query = searchParams.get("q") || ""
  const [results, setResults] = useState<SearchProduct[]>([])
  const [loading, setLoading] = useState(true)

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

  const handleAddToCart = (product: SearchProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
  }

  return (
    <div className="min-h-screen bg-muted flex justify-center">
      <main className="w-full max-w-md bg-card text-card-foreground min-h-screen shadow-xl flex flex-col">
        <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-50">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-bold truncate px-2">
            {query ? "\"" + query + "\" " + (isZh ? "搜索结果" : "Search Results") : (isZh ? "全部商品" : "All Products")}
          </h1>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-muted-foreground">{isZh ? "搜索中..." : "Searching..."}</div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-muted-foreground mb-4">
                {isZh ? "未找到相关商品" : "No products found"}
              </div>
              <Button variant="outline" onClick={() => router.push("/")}>
                {isZh ? "返回首页" : "Back to Home"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                {isZh ? "找到" : "Found"} {results.length} {isZh ? "个商品" : "products"}
              </div>
              {results.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="flex">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <CardContent className="flex-1 p-3 flex flex-col justify-between">
                      <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600 dark:text-red-500">${product.price}</span>
                        <span className="text-xs text-muted-foreground line-through">${product.originalPrice}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => router.push("/product/" + product.id)}
                        >
                          {isZh ? "查看详情" : "Details"}
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function SearchLoading() {
  return (
    <div className="min-h-screen bg-muted flex justify-center items-center">
      <div className="text-muted-foreground">Loading...</div>
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