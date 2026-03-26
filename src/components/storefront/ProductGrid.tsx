"use client"

import * as React from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Flame } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/context/LanguageContext"
import { FEATURED_PRODUCTS } from "./HomeCarousel"

const formatSales = (sales: number) => {
  if (sales >= 1000) {
    return `${(sales / 1000).toFixed(1)}k`
  }
  return sales.toString()
}

const calculateDiscount = (price: number, originalPrice: number) => {
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

const ProductCard = React.memo(function ProductCard({
  product
}: {
  product: typeof FEATURED_PRODUCTS[0]
}) {
  const router = useRouter()
  const discount = calculateDiscount(product.price, product.originalPrice)

  const handleClick = () => {
    router.push(`/product/${product.id}`)
  }

  return (
    <Card
      className="group cursor-pointer overflow-hidden border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
      onClick={handleClick}
    >
      <CardContent className="p-0 relative">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Flame className="w-3 h-3" />
              -{discount}%
            </div>
          )}
          {product.sales >= 1000 && (
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
              <ShoppingCart className="w-3 h-3" />
              {formatSales(product.sales)} sold
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-sm line-clamp-2 leading-snug text-foreground group-hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-lg font-bold text-red-500 dark:text-red-400">
              ${product.price}
            </span>
            {discount > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

export function ProductGrid() {
  const { t } = useLanguage()

  return (
    <div className="w-full px-4 py-6">
      <h2 className="text-xl font-bold mb-6">{t("product.featured")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {FEATURED_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
