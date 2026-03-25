/**
 * ============================================
 * Cross-sell 推荐组件 (v0.5.5)
 * ============================================
 * 功能说明：
 *   - 结账页面 cross-sell 推荐
 *   - "你可能还喜欢" 推荐
 * ============================================
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingBag } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  images: string[]
}

interface CrosssellRecommendationProps {
  currentProductId?: string
  isZh?: boolean
}

export function CrosssellRecommendation({
  currentProductId,
  isZh = false,
}: CrosssellRecommendationProps) {
  const [wishlist, setWishlist] = useState<string[]>([])

  const recommendations: Product[] = []

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingBag size={18} className="text-primary" />
          {isZh ? "你可能还喜欢" : "You May Also Like"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recommendations.map((product) => (
            <div key={product.id} className="space-y-2">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={product.images[0] || "/placeholder.jpg"}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-8 w-8 bg-white/80 hover:bg-white"
                  onClick={() => toggleWishlist(product.id)}
                >
                  <Heart
                    size={16}
                    className={
                      wishlist.includes(product.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-500"
                    }
                  />
                </Button>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium line-clamp-2">{product.name}</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">${product.price.toFixed(2)}</p>
                  <Badge variant="outline" className="text-xs">
                    {isZh ? "精选" : "Featured"}
                  </Badge>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                {isZh ? "查看详情" : "View Details"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}