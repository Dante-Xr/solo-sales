"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import useEmblaCarousel from "embla-carousel-react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

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

export function HomeCarousel() {
  const router = useRouter()
  const { t } = useLanguage()
  const [emblaRef, embla] = useEmblaCarousel({ loop: true })

  const [_timer, setTimer] = React.useState(AUTO_PLAY_DELAY)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

  const startTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setTimer(AUTO_PLAY_DELAY)
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (embla) {
            embla.scrollNext()
          }
          return AUTO_PLAY_DELAY
        }
        return prev - 1
      })
    }, 1000)
  }, [embla])

  const stopTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
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
    <div className="w-full relative px-4 pt-4 pb-2">
      <h2 className="text-lg font-bold mb-3">{t("product.featured")}</h2>
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {FEATURED_PRODUCTS.map((product) => (
              <div key={product.id} className="flex-none w-full">
                <div className="p-1 h-48">
                  <Card
                    className="cursor-pointer overflow-hidden border-none shadow-md h-full"
                    onClick={() => router.push(`/product/${product.id}`)}
                  >
                    <CardContent className="p-0 relative w-full h-full">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority={true}
                      />
                      {/* 限时特惠标签 */}
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                        🔥 {t("product.flashSale")}
                      </div>
                      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3">
                        <h3 className="text-white font-medium text-sm line-clamp-1">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-red-500 dark:text-red-400 font-bold">${product.price}</span>
                          <span className="text-muted-foreground text-xs line-through">${product.originalPrice}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={scrollPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md z-10 transition-opacity opacity-60 hover:opacity-100"
          aria-label={t("common.back")}
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        <button
          onClick={scrollNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md z-10 transition-opacity opacity-60 hover:opacity-100"
          aria-label={t("common.search")}
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>

        {/* 圆点指示器：替代原有数字计时器 */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {FEATURED_PRODUCTS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-6 bg-white' : 'w-1 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
