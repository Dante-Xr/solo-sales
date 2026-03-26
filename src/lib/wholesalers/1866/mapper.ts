/**
 * ============================================
 * 1866 批发商 - 数据映射器 (Task 1.8)
 * ============================================
 * 功能说明：
 *   - 将 1866 批发商品数据映射为系统商品格式
 *   - 实现价格计算、库存映射等逻辑
 * ============================================
 */

import type {
  WholesalerProduct,
  MappedProduct,
  MappingConfig,
  PricingStrategy,
} from "../types"

/**
 * 默认价格计算策略
 * 批发价基础上加价 50%
 */
const DEFAULT_PRICING_STRATEGY: PricingStrategy = {
  markupRate: 1.5, // 加价 50%
  minProfit: 5,    // 最低利润 5 美元
}

/**
 * 默认映射配置
 */
const DEFAULT_MAPPING_CONFIG: MappingConfig = {
  pricing: DEFAULT_PRICING_STRATEGY,
  defaultCategory: "Other",
  imageField: "images",
  stockField: "stock_quantity",
}

/**
 * 数据映射结果
 * 包含映射成功和失败的数据
 */
export interface MappingResult {
  /** 映射成功的数据 */
  success: MappedProduct[]
  /** 映射失败的数据 */
  failed: Array<{
    original: WholesalerProduct
    error: string
  }>
}

/**
 * 计算商品售价
 * 基于批发价和定价策略计算最终售价
 */
export function calculatePrice(
  wholesalePrice: number,
  strategy: PricingStrategy = DEFAULT_PRICING_STRATEGY
): number {
  // 计算基础售价 = 批发价 × 加价率
  let price = wholesalePrice * strategy.markupRate

  // 确保最低利润
  const minPrice = wholesalePrice + strategy.minProfit
  if (price < minPrice) {
    price = minPrice
  }

  // 如果设置了最高利润率限制
  if (strategy.maxProfitRate) {
    const maxPrice = wholesalePrice * (1 + strategy.maxProfitRate)
    price = Math.min(price, maxPrice)
  }

  // 四舍五入到两位小数
  return Math.round(price * 100) / 100
}

/**
 * 将 1866 商品数组映射为系统商品数组
 */
export function mapProducts(
  products: WholesalerProduct[],
  config: Partial<MappingConfig> = {}
): MappingResult {
  const mergedConfig: MappingConfig = {
    ...DEFAULT_MAPPING_CONFIG,
    ...config,
  }

  const result: MappingResult = {
    success: [],
    failed: [],
  }

  for (const product of products) {
    try {
      const mapped = mapSingleProduct(product, mergedConfig)
      result.success.push(mapped)
    } catch (error) {
      result.failed.push({
        original: product,
        error: error instanceof Error ? error.message : "映射失败",
      })
    }
  }

  return result
}

/**
 * 将单个批发商品映射为系统商品格式
 */
export function mapSingleProduct(
  product: WholesalerProduct,
  config: MappingConfig = DEFAULT_MAPPING_CONFIG
): MappedProduct {
  // 验证必填字段
  if (!product.sku) {
    throw new Error("商品 SKU 不能为空")
  }

  if (!product.name) {
    throw new Error("商品名称不能为空")
  }

  if (!product.wholesalePrice || product.wholesalePrice <= 0) {
    throw new Error("批发价格无效")
  }

  // 计算售价
  const price = calculatePrice(product.wholesalePrice, config.pricing)

  // 处理图片列表
  const images = Array.isArray(product.images)
    ? product.images.filter(Boolean).slice(0, 5) // 最多 5 张图片
    : []

  // 处理标签
  const tags = Array.isArray(product.tags)
    ? product.tags.slice(0, 10) // 最多 10 个标签
    : []

  return {
    externalId: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description || "",
    price,
    originalPrice: product.retailPrice || price * 1.2, // 如果没有零售价，估算
    stock: product.stock || 0,
    images: JSON.stringify(images),
    category: product.category || config.defaultCategory,
    tags: JSON.stringify(tags),
    isPublished: true, // 默认上架
    wholesaler: product.wholesaler,
  }
}

/**
 * 检测商品是否重复（基于 SKU）
 */
export function detectDuplicates(
  products: MappedProduct[],
  existingSkus: Set<string>
): {
  new: MappedProduct[]
  duplicate: Array<{ product: MappedProduct; existingSku: string }>
} {
  const result = {
    new: [] as MappedProduct[],
    duplicate: [] as Array<{ product: MappedProduct; existingSku: string }>,
  }

  for (const product of products) {
    if (existingSkus.has(product.sku)) {
      result.duplicate.push({
        product,
        existingSku: product.sku,
      })
    } else {
      result.new.push(product)
    }
  }

  return result
}