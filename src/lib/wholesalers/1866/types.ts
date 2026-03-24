/**
 * ============================================
 * 1866 批发商 - 类型定义 (Task 1.7)
 * ============================================
 * 功能说明：
 *   - 定义 1866 批发商 API 的专用类型
 * ============================================
 */

import type { WholesalerProduct } from "../types"

/**
 * 1866 API 商品数据（原始数据结构）
 * 1866 API 返回的商品信息格式
 */
export interface I1866Product {
  /** 商品 ID */
  product_id: string
  /** 商品 SKU */
  sku: string
  /** 商品名称 */
  product_name: string
  /** 商品描述 */
  description: string
  /** 批发价格 */
  wholesale_price: number
  /** 零售价格 */
  retail_price: number
  /** 图片 URL */
  image_url: string
  /** 其他图片列表 */
  additional_images?: string[]
  /** 库存数量 */
  stock_quantity: number
  /** 商品分类 */
  category_name: string
  /** 商品标签 */
  tags: string[]
  /** 重量（克） */
  weight_grams?: number
  /** 尺寸 */
  dimensions?: {
    length_cm: number
    width_cm: number
    height_cm: number
  }
  /** 最后更新时间 */
  last_update: string
}

/**
 * 1866 API 响应结构
 */
export interface I1866ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

/**
 * 1866 API 商品列表响应
 */
export interface I1866ProductListResponse {
  products: I1866Product[]
  pagination: {
    page: number
    page_size: number
    total_count: number
    total_pages: number
  }
}

/**
 * 1866 API 库存响应
 */
export interface I1866StockResponse {
  sku: string
  available: number
  reserved: number
  total: number
}

/**
 * 将 1866 商品转换为通用批发商品格式
 */
export function transformI1866Product(product: I1866Product): WholesalerProduct {
  // 收集所有图片
  const images = [
    product.image_url,
    ...(product.additional_images || []),
  ].filter(Boolean)

  return {
    id: product.product_id,
    sku: product.sku,
    name: product.product_name,
    description: product.description,
    wholesalePrice: product.wholesale_price,
    retailPrice: product.retail_price,
    images,
    stock: product.stock_quantity,
    category: product.category_name,
    tags: product.tags,
    weight: product.weight_grams,
    dimensions: product.dimensions
      ? {
          length: product.dimensions.length_cm,
          width: product.dimensions.width_cm,
          height: product.dimensions.height_cm,
        }
      : undefined,
    wholesaler: "1866",
    updatedAt: product.last_update,
  }
}