import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/prisma"
import { ProductGridClient } from "@/components/storefront/ProductGridClient"
import { StorefrontHeaderClient } from "@/components/storefront/StorefrontHeaderClient"
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter"
import { ViewportWrapper } from "@/components/storefront/ViewportWrapper"
import type { ProductItem } from "@/components/storefront/HomeCarouselClient"

interface ProductsPageProps {
  searchParams: Promise<{ filter?: string; q?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "All Products - SoloSales",
    description: "Browse all products in our store",
  }
}

function transformProduct(product: {
  id: string
  name: string
  description: string
  price: { toNumber: () => number }
  stock: number
  images: string[]
  isPublished: boolean
  _count?: { orderItems: number }
}): ProductItem {
  const price = product.price.toNumber()
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price,
    originalPrice: Math.round(price * 1.4 * 100) / 100,
    image: product.images[0] || "",
    sales: product._count?.orderItems ?? 0,
    stock: product.stock,
  }
}

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

async function getProducts(filter?: string): Promise<ProductItem[]> {
  try {
    const where: { isPublished: boolean; createdAt?: { gte: Date } } = { isPublished: true }

    if (filter === "new") {
      where.createdAt = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: filter === "best" ? { orderItems: { _count: "desc" } } : { createdAt: "desc" },
      include: {
        _count: { select: { orderItems: true } },
      },
    })

    return products.map(transformProduct)
  } catch (error) {
    console.error("Error fetching products:", error)
    return FALLBACK_PRODUCTS
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { filter } = await searchParams
  const t = await getTranslations("products")
  const products = await getProducts(filter)

  const titles: Record<string, string> = {
    new: t("newArrivals"),
    best: t("bestSellers"),
    sale: t("sales"),
  }

  return (
    <ViewportWrapper>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="w-full max-w-[1440px] mx-auto">
          <StorefrontHeaderClient />

          <main className="flex flex-col pb-16 px-4">
            <div className="py-8">
              <h1 className="text-2xl font-bold mb-2">
                {filter ? titles[filter] || t("allProducts") : t("allProducts")}
              </h1>
              <p className="text-muted-foreground">
                {t("productCount", { count: products.length })}
              </p>
            </div>

            <ProductGridClient products={products} isLoading={false} />
          </main>

          <StorefrontFooter />
        </div>
      </div>
    </ViewportWrapper>
  )
}
