import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "@/lib/cache"

// 将数据库商品数据转换为前端展示格式
function transformProduct(product: {
  id: string
  name: string
  description: string
  price: { toNumber: () => number }
  stock: number
  images: string[]
  isPublished: boolean
  _count?: { orderItems: number }
}) {
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

export async function GET() {
  try {
    const cached = await cacheGet(CACHE_KEYS.FEATURED_PRODUCTS)
    if (cached) {
      return NextResponse.json({ products: cached, fromCache: true })
    }

    const products = await prisma.product.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    })

    const transformed = products.map(transformProduct)

    await cacheSet(CACHE_KEYS.FEATURED_PRODUCTS, transformed, CACHE_TTL.FEATURED_PRODUCTS)

    return NextResponse.json({ products: transformed, fromCache: false })
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return NextResponse.json({ products: [], fromCache: false })
  }
}
