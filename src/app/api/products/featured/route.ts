import { NextResponse } from "next/server"
import { cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "@/lib/cache"

const FEATURED_PRODUCTS = [
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
  },
]

export async function GET() {
  try {
    const cached = await cacheGet(CACHE_KEYS.FEATURED_PRODUCTS)
    if (cached) {
      return NextResponse.json({ products: cached, fromCache: true })
    }

    await cacheSet(CACHE_KEYS.FEATURED_PRODUCTS, FEATURED_PRODUCTS, CACHE_TTL.FEATURED_PRODUCTS)

    return NextResponse.json({ products: FEATURED_PRODUCTS, fromCache: false })
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return NextResponse.json({ products: FEATURED_PRODUCTS, fromCache: false })
  }
}
