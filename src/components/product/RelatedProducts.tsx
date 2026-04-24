"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

interface RelatedProduct {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  discount?: number
}

interface RelatedProductsProps {
  categoryId: string
  currentProductId: string
}

export function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const t = useTranslations("product")
  const router = useRouter()
  const [products, setProducts] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState(true)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const updateScrollState = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    updateScrollState()
    emblaApi.on("select", updateScrollState)
    emblaApi.on("reInit", updateScrollState)
    return () => {
      emblaApi.off("select", updateScrollState)
    }
  }, [emblaApi, updateScrollState])

  useEffect(() => {
    const params = new URLSearchParams({
      categoryId,
      exclude: currentProductId,
      limit: "4",
      isPublished: "true",
    })
    fetch(`/api/products?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.list) {
          setProducts(
            data.data.list.map((p: Record<string, unknown>) => {
              const price = typeof p.price === "object" && p.price !== null && "toNumber" in (p.price as object)
                ? (p.price as { toNumber: () => number }).toNumber()
                : Number(p.price)
              const originalPrice = Math.round(price * 1.4 * 100) / 100
              return {
                id: p.id as string,
                name: p.name as string,
                price,
                originalPrice,
                image: (p.images as string[])?.[0] || "",
                discount: Math.round((1 - price / originalPrice) * 100),
              }
            })
          )
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [categoryId, currentProductId])

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-base font-bold">{t("relatedProducts")}</h3>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-none w-[140px] sm:w-[160px]">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4 mt-2" />
              <Skeleton className="h-4 w-1/2 mt-1" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold">{t("relatedProducts")}</h3>
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-none w-[140px] sm:w-[160px] cursor-pointer group"
                onClick={() => router.push(`/product/${product.id}`)}
              >
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="160px"
                  />
                  {product.discount && product.discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 border-none text-[10px] px-1.5 py-0">
                      -{product.discount}%
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium mt-2 line-clamp-1">{product.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm font-bold text-red-600 dark:text-red-500">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {canScrollPrev && (
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 bg-background/90 hover:bg-background rounded-full flex items-center justify-center shadow-md z-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {canScrollNext && (
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 bg-background/90 hover:bg-background rounded-full flex items-center justify-center shadow-md z-10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
