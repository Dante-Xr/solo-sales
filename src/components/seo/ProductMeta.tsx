/**
 * ============================================
 * 商品 SEO Meta 组件 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 生成商品页面的动态 Meta 标签
 *   - 生成 JSON-LD 结构化数据
 *   - 支持 Open Graph 和 X (Twitter) Card
 * ============================================
 */

import { generateProductSchema, type ProductSchemaData } from "./ProductSchema"

interface ProductMetaProps {
  /** 商品数据 */
  product: {
    id: string
    name: string
    description: string
    images: string[]
    sku?: string | null
    brand?: string | null
    price: number
    currency?: string
    stock?: number
    category?: { name: string } | null
  }
  /** 商品评分统计 */
  ratingStats?: {
    averageRating: number
    reviewCount: number
  }
  /** 页面 URL */
  url: string
}

/**
 * 商品 SEO Meta 组件
 */
export function ProductMeta({ product, ratingStats, url }: ProductMetaProps) {
  // 构建结构化数据
  const schemaData: ProductSchemaData = {
    productId: product.id,
    name: product.name,
    description: product.description,
    images: product.images,
    sku: product.sku || undefined,
    brand: product.brand || undefined,
    price: product.price,
    currency: product.currency || "USD",
    availability: product.stock !== undefined && product.stock > 0 ? "InStock" : "OutOfStock",
    category: product.category?.name,
    ...(ratingStats && {
      aggregateRating: {
        ratingValue: ratingStats.averageRating,
        reviewCount: ratingStats.reviewCount,
      },
    }),
  }

  const productSchema = generateProductSchema(schemaData)

  // 截取描述用于 Meta
  const metaDescription =
    product.description.length > 160
      ? product.description.slice(0, 160) + "..."
      : product.description

  return (
    <>
      {/* 标准 Meta */}
      <title>{product.name} | Solo Sales</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="product" />
      <meta property="og:title" content={product.name} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={url} />
      {product.images[0] && <meta property="og:image" content={product.images[0]} />}
      <meta property="product:price:amount" content={product.price.toString()} />
      <meta property="product:price:currency" content={product.currency || "USD"} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={product.name} />
      <meta name="twitter:description" content={metaDescription} />
      {product.images[0] && <meta name="twitter:image" content={product.images[0]} />}

      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: productSchema }}
      />
    </>
  )
}

/**
 * 面包屑导航组件
 */
export function BreadcrumbMeta({
  items,
}: {
  items: { name: string; url: string }[]
}) {
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
