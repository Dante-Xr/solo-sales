/**
 * ============================================
 * 商品 JSON-LD 结构化数据 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 生成商品 Schema.org 结构化数据
 *   - 用于 Google SEO Rich Results
 *   - 支持商品评分、评论聚合
 * ============================================
 */

/**
 * 商品结构化数据类型
 */
export interface ProductSchemaData {
  productId: string
  name: string
  description: string
  images: string[]
  sku?: string
  brand?: string
  price: number
  currency?: string
  availability?: "InStock" | "OutOfStock" | "PreOrder" | "LimitedAvailability"
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
    bestRating?: number
    worstRating?: number
  }
  reviewCount?: number
  category?: string
}

export function generateProductSchema(data: ProductSchemaData): string {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.name,
    description: data.description,
    image: data.images,
    ...(data.sku && { sku: data.sku }),
    ...(data.brand && {
      brand: { "@type": "Brand", name: data.brand },
    }),
    offers: {
      "@type": "Offer",
      price: data.price,
      priceCurrency: data.currency || "USD",
      availability: data.availability
        ? `https://schema.org/${data.availability}`
        : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "SoloSales" },
    },
  }

  if (data.aggregateRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: data.aggregateRating.ratingValue.toString(),
      reviewCount: data.aggregateRating.reviewCount.toString(),
      bestRating: (data.aggregateRating.bestRating || 5).toString(),
      worstRating: (data.aggregateRating.worstRating || 1).toString(),
    }
  }

  if (data.category) {
    schema.category = data.category
  }

  return JSON.stringify(schema)
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
  return JSON.stringify(schema)
}