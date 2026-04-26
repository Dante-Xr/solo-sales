/**
 * ============================================
 * Upsell 推荐组件 (v0.5.5)
 * ============================================
 * 功能说明：
 *   - 购物车 upsell 推荐
 *   - "常一起购买" 推荐
 * ============================================
 */

"use client"

import { useState } from "react"
import { useCartStore } from "@/stores/useCartStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Plus, Sparkles } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  stock?: number
}

interface UpsellRecommendationProps {
  isZh?: boolean
}

export function UpsellRecommendation({ isZh = false }: UpsellRecommendationProps) {
  const { addToCart } = useCartStore()
  const [loading, setLoading] = useState<string | null>(null)

  const recommendations: Product[] = []

  const handleAddToCart = async (product: Product) => {
    setLoading(product.id)
    try {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || "/placeholder.jpg",
      })
    } finally {
      setLoading(null)
    }
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles size={18} className="text-primary" />
          {isZh ? "常一起购买" : "Frequently Bought Together"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {recommendations.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[160px] space-y-2"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                  <img
                    src={product.images[0] || "/placeholder.jpg"}
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                  {product.stock !== undefined && product.stock <= 5 && (
                    <Badge
                      variant="destructive"
                      className="absolute top-1 right-1 text-xs"
                    >
                      {isZh ? "仅剩" : "Only"}{product.stock}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium line-clamp-2">{product.name}</p>
                  <p className="font-semibold">${product.price.toFixed(2)}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleAddToCart(product)}
                  disabled={loading === product.id}
                >
                  <Plus size={14} className="mr-1" />
                  {isZh ? "加入购物车" : "Add to Cart"}
                </Button>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}