/**
 * 修改时间：2026-05-02 21:59:08 +08:00
 * 修改内容：首页商品读取改为复用带 Prisma 断连重试的服务层，避免页面直接访问数据库绕过容错逻辑。
 * 修改模型：gpt-5.5
 */
import { HomeCarouselClient } from "@/components/storefront/HomeCarouselClient"
import type { ProductItem } from "@/components/storefront/HomeCarouselClient"
import { ProductGridClient } from "@/components/storefront/ProductGridClient"
import { StorefrontHeaderClient } from "@/components/storefront/StorefrontHeaderClient"
import { HeroBanner } from "@/components/storefront/HeroBanner"
import { FeatureSection } from "@/components/storefront/FeatureSection"
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter"
import { ViewportWrapper } from "@/components/storefront/ViewportWrapper"
import { WelcomeModalWrapper } from "@/components/storefront/WelcomeModalWrapper"
import { getFeaturedProducts as getFeaturedProductsFromService } from "@/server/services/product-service"

const FALLBACK_PRODUCTS: ProductItem[] = [
  {
    id: "1",
    name: "Wireless Earbuds Pro",
    description: "Active noise cancelling, Hi-Res audio, 30-hour battery life",
    price: 29.99,
    originalPrice: 49.99,
    image: "https://picsum.photos/seed/earbuds/800/800",
    sales: 1250,
    stock: 100,
  },
  {
    id: "2",
    name: "Smart Watch X1",
    description: "Heart rate monitor, GPS tracking, 7-day battery life",
    price: 59.99,
    originalPrice: 89.99,
    image: "https://picsum.photos/seed/fitwatch/800/800",
    sales: 890,
    stock: 50,
  },
  {
    id: "3",
    name: "Portable Bluetooth Speaker Mini",
    description: "360 surround sound, IPX7 waterproof",
    price: 19.99,
    originalPrice: 34.99,
    image: "https://picsum.photos/seed/speaker/800/800",
    sales: 2100,
    stock: 200,
  },
  {
    id: "4",
    name: "Mechanical Keyboard RGB",
    description: "Blue switches, RGB backlight, full key anti-ghosting",
    price: 39.99,
    originalPrice: 59.99,
    image: "https://picsum.photos/seed/usbhub/800/800",
    sales: 650,
    stock: 80,
  },
  {
    id: "5",
    name: "4K HD Webcam",
    description: "Auto focus, built-in microphone, plug and play",
    price: 24.99,
    originalPrice: 39.99,
    image: "https://picsum.photos/seed/seccam/800/800",
    sales: 430,
    stock: 60,
  },
  {
    id: "6",
    name: "Wireless Charging Pad 15W",
    description: "Fast charging protocol, LED indicator, anti-slip base",
    price: 12.99,
    originalPrice: 19.99,
    image: "https://picsum.photos/seed/charger/800/800",
    sales: 3200,
    stock: 300,
  },
]

async function getFeaturedProducts(): Promise<ProductItem[]> {
  try {
    const result = await getFeaturedProductsFromService()
    return result.products
  } catch (error) {
    // 首页不能因为商品库短暂不可用而白屏，服务层重试耗尽后降级到演示商品。
    console.error("Error fetching featured products:", error)
    return FALLBACK_PRODUCTS
  }
}

export default async function Storefront() {
  const products = await getFeaturedProducts()

  return (
    <ViewportWrapper>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-brand-gradient-from/5 to-brand-gradient-to/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[1440px] mx-auto relative">
        <StorefrontHeaderClient />

        <main className="flex flex-col pb-16">
          {/* Hero Banner：轮播图上方 */}
          <HeroBanner />

          <section className="w-full">
            <div className="h-full">
              <HomeCarouselClient products={products} />
            </div>
          </section>

          <section className="w-full">
            <ProductGridClient products={products} isLoading={false} />
          </section>

          <section className="w-full">
            <FeatureSection />
          </section>

          <section className="w-full">
            <StorefrontFooter />
          </section>
        </main>

        <WelcomeModalWrapper />
      </div>
    </div>
    </ViewportWrapper>
  )
}
