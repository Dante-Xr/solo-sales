"use client"

// 2026-04-13: 更新为使用 next-intl 国际化

import * as React from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"

export const FEATURED_PRODUCTS = [
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
  }
]

const AUTO_PLAY_INTERVAL = 8

const CarouselCard = React.memo(function CarouselCard({
  product,
  isActive,
  onClick
}: {
  product: typeof FEATURED_PRODUCTS[0]
  isActive: boolean
  onClick: () => void
}) {
  const t = useTranslations('product')
  return (
    <div className="flex-none w-full">
      <div className="p-1 h-[250px] md:h-[350px] lg:h-[450px]">
        <Card
          className="cursor-pointer overflow-hidden border-none shadow-md h-full"
          onClick={onClick}
        >
          <CardContent className="p-0 relative w-full h-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority={isActive}
            />
            <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
              🔥 {product.name.includes("加湿器") ? t('limitedOffer') : "Hot Sale"}
            </div>
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 lg:p-6">
              <h3 className="text-white font-medium text-sm lg:text-base line-clamp-1">{product.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-red-500 dark:text-red-400 font-bold text-sm lg:text-base">${product.price}</span>
                <span className="text-muted-foreground text-xs lg:text-sm line-through">${product.originalPrice}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

export function HomeCarousel() {
  const router = useRouter()
  const t = useTranslations('product')
  const [emblaRef, embla] = useEmblaCarousel({ loop: true })
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const emblaApiRef = React.useRef(embla)

  React.useEffect(() => {
    emblaApiRef.current = embla
  }, [embla])

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = React.useCallback(() => {
    clearTimer()
    timerRef.current = setInterval(() => {
      if (emblaApiRef.current) {
        emblaApiRef.current.scrollNext()
      }
    }, AUTO_PLAY_INTERVAL * 1000)
  }, [clearTimer])

  React.useEffect(() => {
    if (!embla) return

    const onSelect = () => {
      setCurrentIndex(embla.selectedScrollSnap())
    }

    embla.on('select', onSelect)
    startTimer()

    return () => {
      embla.off('select', onSelect)
      clearTimer()
    }
  }, [embla, startTimer, clearTimer])

  const scrollPrev = React.useCallback(() => {
    clearTimer()
    if (embla) embla.scrollPrev()
    startTimer()
  }, [embla, startTimer, clearTimer])

  const scrollNext = React.useCallback(() => {
    clearTimer()
    if (embla) embla.scrollNext()
    startTimer()
  }, [embla, startTimer, clearTimer])

  const handleCardClick = React.useCallback((productId: string) => {
    router.push(`/product/${productId}`)
  }, [router])

  return (
    <div className="w-full relative pt-3 pb-2 px-0">
      <h2 className="text-base font-bold mb-2 px-4">{t('featured')}</h2>
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {FEATURED_PRODUCTS.map((product, index) => (
              <CarouselCard
                key={product.id}
                product={product}
                isActive={index === currentIndex}
                onClick={() => handleCardClick(product.id)}
              />
            ))}
          </div>
        </div>

        <button
          onClick={scrollPrev}
          className="absolute left-1 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg z-10 transition-opacity opacity-50 hover:opacity-100"
          aria-label={t('back')}
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        </button>

        <button
          onClick={scrollNext}
          className="absolute right-1 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg z-10 transition-opacity opacity-50 hover:opacity-100"
          aria-label={t('next')}
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        </button>

        <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 md:gap-1.5 z-10">
          {FEATURED_PRODUCTS.map((_, i) => (
            <div
              key={i}
              className={`h-1 md:h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-4 md:w-6 bg-white' : 'w-1 md:w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
