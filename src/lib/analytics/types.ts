/**
 * ============================================
 * 数据分析类型定义 (v0.6.0)
 * ============================================
 */

/**
 * 时间范围
 */
export type TimeRange = "today" | "7d" | "30d" | "90d" | "custom"

/**
 * 时间范围配置
 */
export interface DateRange {
  start: Date
  end: Date
  label: string
}

/**
 * 销售概览数据
 */
export interface SalesOverview {
  totalRevenue: number
  totalOrders: number
  totalVisitors: number
  newCustomers: number
  avgOrderValue: number
  conversionRate: number
  revenueGrowth: number   // 环比增长率
  ordersGrowth: number
  topProducts: TopProduct[]
}

/**
 * 热销商品
 */
export interface TopProduct {
  productId: string
  productName: string
  image: string
  salesCount: number
  salesAmount: number
}

/**
 * 销售趋势数据
 */
export interface SalesTrend {
  date: string
  revenue: number
  orders: number
  visitors: number
}

/**
 * 销售报表数据
 */
export interface SalesReport {
  overview: SalesOverview
  trends: SalesTrend[]
  period: DateRange
  topCategories: CategoryStats[]
  topProducts: TopProduct[]
}

/**
 * 分类统计
 */
export interface CategoryStats {
  categoryId: string
  categoryName: string
  salesCount: number
  salesAmount: number
  percentage: number
}

/**
 * 客户分析数据
 */
export interface CustomerReport {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  customerLTV: number         // Lifetime Value
  avgOrdersPerCustomer: number
  topCustomers: TopCustomer[]
  customerSegmentation: Segmentation[]
}

/**
 * 客户统计
 */
export interface TopCustomer {
  userId: string
  name: string
  email: string
  totalOrders: number
  totalSpent: number
  lastOrderDate: Date
}

/**
 * 客户分层
 */
export interface Segmentation {
  segment: "new" | "active" | "inactive" | "churned"
  count: number
  percentage: number
}

/**
 * 商品分析数据
 */
export interface ProductReport {
  totalProducts: number
  activeProducts: number
  outOfStockProducts: number
  lowStockProducts: number
  topSelling: TopProduct[]
  worstSelling: BottomProduct[]
  categoryDistribution: CategoryStats[]
}

/**
 * 滞销商品
 */
export interface BottomProduct {
  productId: string
  productName: string
  image: string
  salesCount: number
  stock: number
}

/**
 * 库存预警
 */
export interface StockAlert {
  productId: string
  productName: string
  currentStock: number
  threshold: number
  severity: "low" | "medium" | "high"
}

/**
 * 库存报表
 */
export interface InventoryReport {
  totalProducts: number
  inStock: number
  lowStock: number
  outOfStock: number
  totalValue: number
  alerts: StockAlert[]
}

/**
 * 导出格式
 */
export type ExportFormat = "csv" | "xlsx" | "json"

/**
 * 导出选项
 */
export interface ExportOptions {
  format: ExportFormat
  dateRange: DateRange
  includeHeaders: boolean
  filename?: string
}
