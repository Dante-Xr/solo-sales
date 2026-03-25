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
  /** 商品 ID */
  productId: string
  /** 商品名称 */
  name: string
  /** 商品描述 */
  description: string
  /** 商品图片 URL 数组 */
  images: string[]
  /** 商品 SKU */
  sku?: string
  /** 品牌名称 */
  brand?: string
  /** 商品价格 */
  price: number
  /** 价格货币 */
  currency?: string
  /** 库存状态 */
  availability?: "InStock" | "OutOfStock" | "PreOrder" | "LimitedAvailability"
  /** 平均评分 */
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
    bestRating?: number
    worstRating?: number
  }
  /** 评论数量 */
  reviewCount?: number
  /** 分类 */
  category?: string
}

/**
 * 生成商品 JSON-LD 结构化数据
 */
export function generateProductSchema(data: ProductSchemaData): string {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.name,
    description: data.description,
    image: data.images,
    ...(data.sku && { sku: data.sku }),
    ...(data.brand && {
      brand: {
        "@type": "Brand",
        name: data.brand,
      },
    }),
    offers: {
      "@type": "Offer",
      price: data.price,
      priceCurrency: data.currency || "USD",
      availability: data.availability
        ? `https://schema.org/${data.availability}`
        : "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "SoloSales",
      },
    },
  }

  // 添加评分聚合
  if (data.aggregateRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: data.aggregateRating.ratingValue.toString(),
      reviewCount: data.aggregateRating.reviewCount.toString(),
      bestRating: (data.aggregateRating.bestRating || 5).toString(),
      worstRating: (data.aggregateRating.worstRating || 1).toString(),
    }
  }

  // 添加分类
  if (data.category) {
    schema.category = data.category
  }

  return JSON.stringify(schema)
}

/**
 * 生成面包屑导航结构化数据
 */
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

/**
 * 生成评论结构化数据
 */
export function generateReviewSchema(
  reviews: {
    author: string
    datePublished: string
    reviewBody: string
    reviewRating: {
      ratingValue: number
      bestRating?: number
      worstRating?: number
    }
  }[]
): string {
  const schema = reviews.map((review) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    author: {
      "@type": "Person",
      name: review.author,
    },
    datePublished: review.datePublished,
    reviewBody: review.reviewBody,
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.reviewRating.ratingValue.toString(),
      bestRating: (review.reviewRating.bestRating || 5).toString(),
      worstRating: (review.reviewRating.worstRating || 1).toString(),
    },
  }))

  return JSON.stringify(schema)
}