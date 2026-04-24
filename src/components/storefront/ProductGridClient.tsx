"use client"

import * as React from "react"
import Image from "next/image"
import { ShoppingCart, Flame } from "lucide-react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { ProductItem } from "./HomeCarouselClient"
import { Skeleton } from "@/components/ui/skeleton"
import { StockBadge } from "@/components/product/StockBadge"

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
  product: ProductItem
}) {
  const router = useRouter()
  const t = useTranslations('product')
  const discount = calculateDiscount(product.price, product.originalPrice)

  const handleClick = () => {
    router.push(`/product/${product.id}`)
  }

  return (
    <button
      type="button"
      className="w-full text-left group cursor-pointer overflow-hidden border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-lg"
      onClick={handleClick}
    >
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
            {formatSales(product.sales)} {t('sold')}
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
          <StockBadge stock={product.stock ?? 0} />
        </div>
      </div>
    </button>
  )
})

export function ProductCardSkeleton() {
  return (
    <div className="w-full overflow-hidden border-border/50 rounded-lg animate-pulse">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center gap-2 mt-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="w-full px-3 py-4">
      <Skeleton className="h-6 w-24 mb-4" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: count }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function ProductGridClient({ products, isLoading }: { products: ProductItem[]; isLoading?: boolean }) {
  const t = useTranslations('product')

  if (isLoading || !products || products.length === 0) {
    return <ProductGridSkeleton />
  }

  return (
    <div className="w-full px-3 py-4">
      <h2 className="text-base font-bold mb-4">{t('featured')}</h2>
      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
