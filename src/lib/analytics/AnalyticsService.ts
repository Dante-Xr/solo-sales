/**
 * ============================================
 * 数据分析服务 (v0.6.0)
 * ============================================
 * 功能：
 *   - 销售数据分析
 *   - 客户分析
 *   - 商品分析
 *   - 库存分析
 * ============================================
 */

import { prisma } from "@/lib/prisma"
import { cacheGet, cacheSet, CACHE_KEYS } from "@/lib/cache"
import {
  TimeRange,
  DateRange,
  SalesOverview,
  SalesTrend,
  SalesReport,
  CustomerReport,
  ProductReport,
  InventoryReport,
  TopProduct,
  TopCustomer,
  CategoryStats,
  Segmentation,
  StockAlert
} from "./types"

const ANALYTICS_CACHE_TTL = 5 * 60 // 5 分钟

export class AnalyticsService {
  /**
   * 获取日期范围
   */
  getDateRange(timeRange: TimeRange, custom?: { start: Date; end: Date }): DateRange {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (timeRange) {
      case "today":
        return {
          start: today,
          end: now,
          label: "今天"
        }
      case "7d":
        return {
          start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: now,
          label: "最近 7 天"
        }
      case "30d":
        return {
          start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: now,
          label: "最近 30 天"
        }
      case "90d":
        return {
          start: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
          end: now,
          label: "最近 90 天"
        }
      case "custom":
        if (!custom) throw new Error("自定义时间范围需要提供 start 和 end")
        return {
          start: custom.start,
          end: custom.end,
          label: "自定义"
        }
      default:
        return {
          start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: now,
          label: "最近 30 天"
        }
    }
  }

  /**
   * 获取销售概览
   */
  async getSalesOverview(dateRange: DateRange): Promise<SalesOverview> {
    const cacheKey = `${CACHE_KEYS.ANALYTICS_SALES_OVERVIEW || "analytics:sales:overview"}:${dateRange.start.toISOString()}:${dateRange.end.toISOString()}`

    const cached = await cacheGet<SalesOverview>(cacheKey)
    if (cached) return cached

    // 查询订单数据
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      select: {
        totalAmount: true,
        id: true,
        userId: true,
        createdAt: true
      }
    })

    // 计算基础指标
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
    const totalOrders = orders.length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // 计算新客户数
    const newCustomers = await prisma.user.count({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    })

    // 获取唯一购买用户数
    const uniqueUsers = new Set(orders.map(o => o.userId))
    const returningCustomers = uniqueUsers.size - newCustomers

    // 获取热销商品
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end
          }
        }
      },
      select: {
        productId: true,
        quantity: true,
        price: true
      }
    })

    // 聚合商品销售
    const productSales: Record<string, { count: number; amount: number }> = {}
    for (const item of orderItems) {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { count: 0, amount: 0 }
      }
      productSales[item.productId].count += item.quantity
      productSales[item.productId].amount += Number(item.price) * item.quantity
    }

    const topProducts = await this.getTopProducts(productSales, 5)

    const overview: SalesOverview = {
      totalRevenue,
      totalOrders,
      totalVisitors: uniqueUsers.size,
      newCustomers,
      avgOrderValue,
      conversionRate: 0, // 需要访问数据才能计算
      revenueGrowth: 0,
      ordersGrowth: 0,
      topProducts
    }

    await cacheSet(cacheKey, overview, ANALYTICS_CACHE_TTL)
    return overview
  }

  /**
   * 获取销售趋势
   */
  async getSalesTrends(dateRange: DateRange): Promise<SalesTrend[]> {
    const cacheKey = `${CACHE_KEYS.ANALYTICS_SALES_TRENDS || "analytics:sales:trends"}:${dateRange.start.toISOString()}:${dateRange.end.toISOString()}`

    const cached = await cacheGet<SalesTrend[]>(cacheKey)
    if (cached) return cached

    // 查询订单数据
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      select: {
        totalAmount: true,
        createdAt: true
      }
    })

    // 按日期聚合
    const dailyData: Record<string, { revenue: number; orders: number }> = {}

    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split("T")[0]
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { revenue: 0, orders: 0 }
      }
      dailyData[dateKey].revenue += Number(order.totalAmount)
      dailyData[dateKey].orders++
    }

    // 填充缺失的日期
    const trends: SalesTrend[] = []
    const currentDate = new Date(dateRange.start)
    while (currentDate <= dateRange.end) {
      const dateKey = currentDate.toISOString().split("T")[0]
      trends.push({
        date: dateKey,
        revenue: dailyData[dateKey]?.revenue || 0,
        orders: dailyData[dateKey]?.orders || 0,
        visitors: 0
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    await cacheSet(cacheKey, trends, ANALYTICS_CACHE_TTL)
    return trends
  }

  /**
   * 获取客户报告
   */
  async getCustomerReport(dateRange: DateRange): Promise<CustomerReport> {
    const cacheKey = `${CACHE_KEYS.ANALYTICS_CUSTOMER || "analytics:customer"}:${dateRange.start.toISOString()}:${dateRange.end.toISOString()}`

    const cached = await cacheGet<CustomerReport>(cacheKey)
    if (cached) return cached

    // 总客户数
    const totalCustomers = await prisma.user.count()

    // 新客户数
    const newCustomers = await prisma.user.count({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    })

    // 有订单的客户数
    const customersWithOrders = await prisma.user.findMany({
      where: {
        orders: {
          some: {
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        orders: {
          where: {
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end
            }
          },
          select: {
            totalAmount: true,
            createdAt: true
          }
        }
      }
    })

    const returningCustomers = customersWithOrders.length - newCustomers

    // 计算 LTV
    const allOrders = await prisma.order.findMany({
      select: { totalAmount: true }
    })
    const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
    const customerLTV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0

    const avgOrdersPerCustomer = customersWithOrders.length > 0
      ? customersWithOrders.reduce((sum, c) => sum + c.orders.length, 0) / customersWithOrders.length
      : 0

    // Top 客户
    const topCustomers: TopCustomer[] = customersWithOrders
      .map(c => ({
        userId: c.id,
        name: c.name || "匿名",
        email: c.email || "",
        totalOrders: c.orders.length,
        totalSpent: c.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
        lastOrderDate: c.orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.createdAt || new Date()
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)

    // 客户分层
    const segmentation: Segmentation[] = [
      { segment: "new", count: newCustomers, percentage: totalCustomers > 0 ? newCustomers / totalCustomers * 100 : 0 },
      { segment: "active", count: returningCustomers, percentage: totalCustomers > 0 ? returningCustomers / totalCustomers * 100 : 0 },
      { segment: "inactive", count: 0, percentage: 0 },
      { segment: "churned", count: 0, percentage: 0 }
    ]

    const report: CustomerReport = {
      totalCustomers,
      newCustomers,
      returningCustomers,
      customerLTV,
      avgOrdersPerCustomer,
      topCustomers,
      customerSegmentation: segmentation
    }

    await cacheSet(cacheKey, report, ANALYTICS_CACHE_TTL)
    return report
  }

  /**
   * 获取商品报告
   */
  async getProductReport(dateRange: DateRange): Promise<ProductReport> {
    const cacheKey = `${CACHE_KEYS.ANALYTICS_PRODUCT || "analytics:product"}:${dateRange.start.toISOString()}:${dateRange.end.toISOString()}`

    const cached = await cacheGet<ProductReport>(cacheKey)
    if (cached) return cached

    // 商品统计
    const totalProducts = await prisma.product.count()
    const activeProducts = await prisma.product.count({ where: { isPublished: true } })

    // 库存统计
    const outOfStockProducts = await prisma.product.count({ where: { stock: 0 } })
    const lowStockProducts = await prisma.product.count({
      where: {
        stock: { gt: 0, lte: 10 }
      }
    })

    // 热销商品
    const orderItems = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      where: {
        order: {
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end
          }
        }
      },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10
    })

    const productSales: Record<string, number> = {}
    for (const item of orderItems) {
      productSales[item.productId] = item._sum.quantity || 0
    }

    const topSelling = await this.getTopProductsFromIds(productSales, 5)

    // 滞销商品
    const allProducts = await prisma.product.findMany({
      where: { isPublished: true },
      select: { id: true, stock: true },
      take: 100
    })

    const soldProducts = new Set(Object.keys(productSales))
    const worstSelling = allProducts
      .filter(p => !soldProducts.has(p.id))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5)
      .map(p => ({
        productId: p.id,
        productName: "",
        image: "",
        salesCount: 0,
        stock: p.stock
      }))

    // 分类分布
    const categoryStats = await this.getCategoryDistribution(dateRange)

    const report: ProductReport = {
      totalProducts,
      activeProducts,
      outOfStockProducts,
      lowStockProducts,
      topSelling,
      worstSelling,
      categoryDistribution: categoryStats
    }

    await cacheSet(cacheKey, report, ANALYTICS_CACHE_TTL)
    return report
  }

  /**
   * 获取库存报告
   */
  async getInventoryReport(): Promise<InventoryReport> {
    const cacheKey = CACHE_KEYS.ANALYTICS_INVENTORY || "analytics:inventory"

    const cached = await cacheGet<InventoryReport>(cacheKey)
    if (cached) return cached

    const totalProducts = await prisma.product.count()
    const inStock = await prisma.product.count({ where: { stock: { gt: 10 } } })
    const lowStock = await prisma.product.count({ where: { stock: { gt: 0, lte: 10 } } })
    const outOfStock = await prisma.product.count({ where: { stock: 0 } } })

    const products = await prisma.product.findMany({
      where: { stock: { gt: 0 } },
      select: { price: true, stock: true }
    })

    const totalValue = products.reduce((sum, p) => sum + Number(p.price) * p.stock, 0)

    // 库存预警
    const alertProducts = await prisma.product.findMany({
      where: {
        stock: { lte: 10 }
      },
      select: { id: true, name: true, stock: true },
      orderBy: { stock: "asc" },
      take: 10
    })

    const alerts: StockAlert[] = alertProducts.map(p => ({
      productId: p.id,
      productName: p.name,
      currentStock: p.stock,
      threshold: 10,
      severity: p.stock === 0 ? "high" : p.stock <= 5 ? "medium" : "low"
    }))

    const report: InventoryReport = {
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
      totalValue,
      alerts
    }

    await cacheSet(cacheKey, report, ANALYTICS_CACHE_TTL)
    return report
  }

  /**
   * 获取热销商品
   */
  private async getTopProducts(
    productSales: Record<string, { count: number; amount: number }>,
    limit: number
  ): Promise<TopProduct[]> {
    const productIds = Object.keys(productSales)
    if (productIds.length === 0) return []

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, images: true }
    })

    return products
      .map(p => ({
        productId: p.id,
        productName: p.name,
        image: p.images[0] || "",
        salesCount: productSales[p.id]?.count || 0,
        salesAmount: productSales[p.id]?.amount || 0
      }))
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, limit)
  }

  private async getTopProductsFromIds(
    productSales: Record<string, number>,
    limit: number
  ): Promise<TopProduct[]> {
    const productIds = Object.keys(productSales)
    if (productIds.length === 0) return []

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, images: true }
    })

    return products
      .map(p => ({
        productId: p.id,
        productName: p.name,
        image: p.images[0] || "",
        salesCount: productSales[p.id] || 0,
        salesAmount: 0
      }))
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, limit)
  }

  /**
   * 获取分类分布
   */
  private async getCategoryDistribution(dateRange: DateRange): Promise<CategoryStats[]> {
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end
          }
        }
      },
      include: {
        product: {
          select: { categoryId: true }
        }
      }
    })

    const categorySales: Record<string, number> = {}
    for (const item of orderItems) {
      const catId = item.product.categoryId || "uncategorized"
      if (!categorySales[catId]) categorySales[catId] = 0
      categorySales[catId] += item.quantity
    }

    const categories = await prisma.category.findMany({
      where: { id: { in: Object.keys(categorySales) } },
      select: { id: true, name: true }
    })

    const totalSales = Object.values(categorySales).reduce((sum, v) => sum + v, 0)

    return categories
      .map(c => ({
        categoryId: c.id,
        categoryName: c.name,
        salesCount: categorySales[c.id] || 0,
        salesAmount: 0,
        percentage: totalSales > 0 ? (categorySales[c.id] || 0) / totalSales * 100 : 0
      }))
      .sort((a, b) => b.salesCount - a.salesCount)
  }
}

let analyticsService: AnalyticsService | null = null

export function getAnalyticsService(): AnalyticsService {
  if (!analyticsService) {
    analyticsService = new AnalyticsService()
  }
  return analyticsService
}
