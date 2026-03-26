"use client"

// 2026-03-24: HomeCarousel 轮播组件性能优化
// 优化点：移除每秒触发的 useState 更新，改为纯 ref 计时的方式
// 避免轮播过程中因状态更新导致的频繁重渲染
import * as React from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { useRouter } from "next/navigation"

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

const AUTO_PLAY_DELAY = 10

// 2026-03-24: 使用 React.memo 优化轮播卡片组件，避免不必要重渲染
const CarouselCard = React.memo(function CarouselCard({
  product,
  isActive,
  onClick
}: {
  product: typeof FEATURED_PRODUCTS[0]
  isActive: boolean
  onClick: () => void
}) {
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
              🔥 {product.name.includes("加湿器") ? "限时特惠" : "Hot Sale"}
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

// 2026-03-24: 轮播卡片点击处理器工厂函数，避免在渲染时创建新函数
// 使用 useCallback 缓存，确保子组件不会因回调函数变化而重渲染
const getCarouselCardClickHandler = (router: ReturnType<typeof useRouter>, productId: string) => {
  const handler = () => {
    router.push(`/product/${productId}`)
  }
  return handler
}

export function HomeCarousel() {
  const router = useRouter()
  const { t } = useLanguage()
  const [emblaRef, embla] = useEmblaCarousel({ loop: true })

  // 2026-03-24: 优化：移除每秒更新状态的 useState，改为纯 ref 计时
  // 这样可以避免每秒触发组件重渲染，提升滚动性能
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const timerRef = React.useRef<{
    interval: ReturnType<typeof setInterval> | null
    remaining: number
  } | null>(null)

  // 2026-03-24: 使用 ref 存储 embla 实例，避免闭包问题
  // 使用 useEffect 而非直接赋值，避免 "Cannot update ref during render" 错误
  const emblaRefStore = React.useRef(embla)

  React.useEffect(() => {
    emblaRefStore.current = embla
  }, [embla])

  const startTimer = React.useCallback(() => {
    if (timerRef.current?.interval) {
      clearInterval(timerRef.current.interval)
    }

    // 2026-03-24: 使用 ref 存储剩余时间，不触发渲染
    timerRef.current = {
      interval: null,
      remaining: AUTO_PLAY_DELAY
    }

    timerRef.current.interval = setInterval(() => {
      if (!timerRef.current) return

      timerRef.current.remaining -= 1

      if (timerRef.current.remaining <= 0) {
        if (emblaRefStore.current) {
          emblaRefStore.current.scrollNext()
        }
        timerRef.current.remaining = AUTO_PLAY_DELAY
      }
    }, 1000)
  }, [])

  const stopTimer = React.useCallback(() => {
    if (timerRef.current?.interval) {
      clearInterval(timerRef.current.interval)
      timerRef.current = null
    }
  }, [])

  React.useEffect(() => {
    if (!embla) return

    const onSelect = () => {
      setCurrentIndex(embla.selectedScrollSnap())
    }

    embla.on('select', onSelect)
    startTimer()

    return () => {
      embla.off('select', onSelect)
      stopTimer()
    }
  }, [embla, startTimer, stopTimer])

  const scrollPrev = React.useCallback(() => {
    stopTimer()
    if (embla) embla.scrollPrev()
    startTimer()
  }, [embla, startTimer, stopTimer])

  const scrollNext = React.useCallback(() => {
    stopTimer()
    if (embla) embla.scrollNext()
    startTimer()
  }, [embla, startTimer, stopTimer])

  return (
    <div className="w-full relative pt-4 pb-2">
      <h2 className="text-lg font-bold mb-3">{t("product.featured")}</h2>
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {FEATURED_PRODUCTS.map((product, index) => (
              <CarouselCard
                key={product.id}
                product={product}
                isActive={index === currentIndex}
                onClick={getCarouselCardClickHandler(router, product.id)}
              />
            ))}
          </div>
        </div>

        <button
          onClick={scrollPrev}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg z-10 transition-opacity opacity-60 hover:opacity-100"
          aria-label={t("common.back")}
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
        </button>

        <button
          onClick={scrollNext}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg z-10 transition-opacity opacity-60 hover:opacity-100"
          aria-label={t("common.search")}
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
        </button>

        <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-10">
          {FEATURED_PRODUCTS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-6 md:w-8 bg-white' : 'w-1.5 md:w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}