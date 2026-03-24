/**
 * ============================================
 * 批发网站 API 对接 - 通用类型定义 (Task 1.5)
 * ============================================
 * 功能说明：
 *   - 定义批发商品、导入结果、API配置等通用类型
 * ============================================
 */

/**
 * 批发商品基本信息
 * 从批发网站 API 获取的商品数据结构
 */
export interface WholesalerProduct {
  /** 批发商商品 ID */
  id: string
  /** 商品 SKU */
  sku: string
  /** 商品名称 */
  name: string
  /** 商品描述 */
  description: string
  /** 批发价格 */
  wholesalePrice: number
  /** 零售价格（指导价） */
  retailPrice: number
  /** 商品图片 URL 列表 */
  images: string[]
  /** 库存数量 */
  stock: number
  /** 商品类别 */
  category: string
  /** 商品标签 */
  tags: string[]
  /** 重量（克） */
  weight?: number
  /** 尺寸信息 */
  dimensions?: {
    length: number
    width: number
    height: number
  }
  /** 批发商名称 */
  wholesaler: string
  /** 最后更新时间 */
  updatedAt: string
}

/**
 * 系统商品映射后的数据结构
 * 将批发商品转换为系统商品格式
 */
export interface MappedProduct {
  /** 外部批发商商品 ID */
  externalId: string
  /** 商品 SKU */
  sku: string
  /** 商品名称 */
  name: string
  /** 商品描述 */
  description: string
  /** 售价（已计算加价） */
  price: number
  /** 原价（零售指导价） */
  originalPrice: number
  /** 库存数量 */
  stock: number
  /** 商品图片列表（JSON 字符串） */
  images: string
  /** 商品类别 */
  category: string
  /** 标签（JSON 字符串） */
  tags: string
  /** 是否上架 */
  isPublished: boolean
  /** 批发商名称 */
  wholesaler: string
}

/**
 * 导入日志详情
 * 记录每次导入操作的详细信息
 */
export interface ImportLogDetail {
  /** 导入记录 ID */
  id: string
  /** 批发商名称 */
  wholesaler: string
  /** 导入状态 */
  status: ImportStatus
  /** 总商品数 */
  totalProducts: number
  /** 成功数量 */
  successCount: number
  /** 失败数量 */
  failCount: number
  /** 错误详情列表 */
  errorDetails: string[]
  /** 开始时间 */
  startedAt: string
  /** 完成时间 */
  completedAt?: string
  /** 触发者 ID */
  triggeredBy: string
}

/**
 * 导入结果
 * 返回导入操作的结果汇总
 */
export interface ImportResult {
  /** 是否成功 */
  success: boolean
  /** 总处理数 */
  total: number
  /** 成功数 */
  successCount: number
  /** 失败数 */
  failCount: number
  /** 错误详情 */
  errors: string[]
  /** 导入日志 ID */
  logId?: string
}

/**
 * 导入状态枚举
 */
export type ImportStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED"

/**
 * 批发商 API 配置
 */
export interface WholesalerConfig {
  /** 批发商名称 */
  name: string
  /** API 基础 URL */
  baseUrl: string
  /** API Key */
  apiKey: string
  /** API Secret */
  apiSecret?: string
  /** 请求超时时间（毫秒） */
  timeout: number
  /** 重试次数 */
  retryTimes: number
}

/**
 * 批发商客户端接口
 * 定义批发商 API 客户端需要实现的方法
 */
export interface WholesalerClient {
  /** 获取批发商名称 */
  getName(): string
  /** 测试 API 连接 */
  testConnection(): Promise<boolean>
  /** 获取商品列表 */
  getProducts(params?: GetProductsParams): Promise<WholesalerProduct[]>
  /** 获取单个商品详情 */
  getProductById(id: string): Promise<WholesalerProduct | null>
}

/**
 * 获取商品列表的参数
 */
export interface GetProductsParams {
  /** 页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
  /** 分类筛选 */
  category?: string
  /** 搜索关键词 */
  keyword?: string
  /** 排序字段 */
  sortBy?: "price" | "stock" | "updatedAt"
  /** 排序方向 */
  sortOrder?: "asc" | "desc"
}

/**
 * 价格计算策略配置
 */
export interface PricingStrategy {
  /** 加价率（如 1.5 表示加价 50%） */
  markupRate: number
  /** 最低利润金额 */
  minProfit: number
  /** 最高利润率限制 */
  maxProfitRate?: number
}

/**
 * 数据映射配置
 */
export interface MappingConfig {
  /** 价格计算策略 */
  pricing: PricingStrategy
  /** 默认分类 */
  defaultCategory: string
  /** 图片字段映射 */
  imageField: string
  /** 库存字段映射 */
  stockField: string
}