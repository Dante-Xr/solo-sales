/**
 * ============================================
 * 1866 批发商 - API 客户端实现 (Task 1.7)
 * ============================================
 * 功能说明：
 *   - 实现 1866 批发商 API 客户端
 *   - 提供商品查询、库存查询等功能
 * ============================================
 */

import { BaseWholesalerClient, WholesalerApiError } from "../client"
import type { WholesalerConfig, WholesalerProduct, GetProductsParams } from "../types"
import type {
  I1866ProductListResponse,
  I1866StockResponse,
  transformI1866Product,
} from "./types"

export { type I1866Product } from "./types"

/**
 * 1866 API 客户端
 * 用于对接 1866 批发商 API
 */
export class I1866Client extends BaseWholesalerClient {
  constructor(config: WholesalerConfig) {
    // 设置默认值，config 中的值会覆盖默认值
    super({
      ...config,
      name: config.name || "1866",
      baseUrl: config.baseUrl || "https://api.1866.com/v1",
      timeout: config.timeout || 30000,
      retryTimes: config.retryTimes || 3,
    })
  }

  /**
   * 获取批发商名称
   */
  getName(): string {
    return "1866"
  }

  /**
   * 测试 API 连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.get<{ status: string }>("/health")
      return true
    } catch (error) {
      console.error("1866 API 连接测试失败:", error)
      return false
    }
  }

  /**
   * 获取商品列表
   */
  async getProducts(params?: GetProductsParams): Promise<WholesalerProduct[]> {
    const requestParams: Record<string, string> = {
      page: String(params?.page || 1),
      page_size: String(params?.pageSize || 50),
    }

    if (params?.category) {
      requestParams.category = params.category
    }

    if (params?.keyword) {
      requestParams.search = params.keyword
    }

    if (params?.sortBy) {
      requestParams.sort_by = params.sortBy
      requestParams.sort_order = params.sortOrder || "desc"
    }

    try {
      const response = await this.get<I1866ProductListResponse>(
        "/products",
        requestParams
      )

      return response.products.map((product) => ({
        id: product.product_id,
        sku: product.sku,
        name: product.product_name,
        description: product.description,
        wholesalePrice: product.wholesale_price,
        retailPrice: product.retail_price,
        images: [product.image_url, ...(product.additional_images || [])].filter(
          Boolean
        ),
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
      }))
    } catch (error) {
      if (error instanceof WholesalerApiError) {
        throw error
      }
      console.error("获取 1866 商品列表失败:", error)
      throw new WholesalerApiError("获取商品列表失败", 500, "FETCH_ERROR")
    }
  }

  /**
   * 获取单个商品详情
   */
  async getProductById(id: string): Promise<WholesalerProduct | null> {
    try {
      const response = await this.get<{ product: I1866ProductListResponse["products"][0] }>(
        `/products/${id}`
      )

      if (!response.product) {
        return null
      }

      const product = response.product
      return {
        id: product.product_id,
        sku: product.sku,
        name: product.product_name,
        description: product.description,
        wholesalePrice: product.wholesale_price,
        retailPrice: product.retail_price,
        images: [product.image_url, ...(product.additional_images || [])].filter(
          Boolean
        ),
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
    } catch (error) {
      if (error instanceof WholesalerApiError) {
        if (error.statusCode === 404) {
          return null
        }
        throw error
      }
      console.error("获取 1866 商品详情失败:", error)
      throw new WholesalerApiError("获取商品详情失败", 500, "FETCH_ERROR")
    }
  }

  /**
   * 获取库存信息
   */
  async getStock(sku: string): Promise<I1866StockResponse | null> {
    try {
      const response = await this.get<I1866StockResponse>(`/stock/${sku}`)
      return response
    } catch (error) {
      if (error instanceof WholesalerApiError && error.statusCode === 404) {
        return null
      }
      console.error("获取 1866 库存失败:", error)
      throw new WholesalerApiError("获取库存失败", 500, "FETCH_ERROR")
    }
  }

  /**
   * 批量获取库存
   */
  async getBatchStock(skus: string[]): Promise<I1866StockResponse[]> {
    try {
      const response = await this.post<{ stock_list: I1866StockResponse[] }>(
        "/stock/batch",
        { skus }
      )
      return response.stock_list
    } catch (error) {
      console.error("批量获取 1866 库存失败:", error)
      throw new WholesalerApiError("批量获取库存失败", 500, "FETCH_ERROR")
    }
  }
}