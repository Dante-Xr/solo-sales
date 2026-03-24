/**
 * ============================================
 * 后台管理控制台页面 (v0.4.1 优化版)
 * ============================================
 * 功能说明：
 *   - 使用聚合 Dashboard API，单次请求获取所有数据
 *   - 支持缓存，提升加载速度
 *   - 集成销售趋势图表组件
 *   - 最近订单列表
 * ============================================
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Package, ShoppingCart, Users, RefreshCw } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { SalesChart } from "@/components/admin/SalesChart"

// 仪表盘数据类型
interface DashboardStats {
  totalRevenue: number
  revenueChange: number
  totalOrders: number
  ordersChange: number
  activeProducts: number
  productsChange: number
  activeUsers: number
  usersChange: number
}

interface RecentOrder {
  id: string
  customerName: string
  customerEmail: string
  totalAmount: number
  status: string
  createdAt: string
}

interface ChartDataPoint {
  date: string
  sales: number
  orders: number
  revenue: number
}

interface DashboardData {
  stats: DashboardStats
  recentOrders: RecentOrder[]
  chartData: ChartDataPoint[]
}

export default function AdminDashboard() {
  const { t } = useLanguage()
  const isZh = t("common.loading").includes("加载") || t("product.featured").includes("热")

  // 控制台统计数据
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    activeProducts: 0,
    productsChange: 0,
    activeUsers: 0,
    usersChange: 0,
  })

  // 最近订单
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])

  // 图表数据
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  // 加载状态
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [fromCache, setFromCache] = useState(false)

  /**
   * 获取控制台数据（使用聚合 API）
   */
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      const response = await fetch("/api/admin/dashboard")
      const result = await response.json()

      if (result.success) {
        setStats(result.data.stats)
        setRecentOrders(result.data.recentOrders)
        setChartData(result.data.chartData)
        setFromCache(result.fromCache || false)
      }
    } catch (error) {
      console.error("获取控制台数据失败:", error)
    }
  }, [])

  /**
   * 初始加载数据
   */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchDashboardData()
      setLoading(false)
    }
    loadData()
  }, [fetchDashboardData])

  /**
   * 刷新数据
   */
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData(true)
    setRefreshing(false)
  }

  /**
   * 格式化金额
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  /**
   * 格式化日期
   */
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(isZh ? "zh-CN" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  /**
   * 获取订单状态标签
   */
  const getOrderStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      PENDING: { color: "bg-yellow-500", label: isZh ? "待处理" : "Pending" },
      PAID: { color: "bg-blue-500", label: isZh ? "已支付" : "Paid" },
      SHIPPED: { color: "bg-purple-500", label: isZh ? "已发货" : "Shipped" },
      DELIVERED: { color: "bg-green-500", label: isZh ? "已完成" : "Delivered" },
      CANCELLED: { color: "bg-red-500", label: isZh ? "已取消" : "Cancelled" },
    }
    const { color, label } = config[status] || { color: "bg-gray-500", label: status }
    return (
      <span className={`${color} text-white text-xs px-2 py-0.5 rounded-full`}>
        {label}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">{t("admin.dashboard")}</h2>
          {fromCache && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {isZh ? "缓存" : "Cached"}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? (isZh ? "刷新中..." : "Refreshing...") : (isZh ? "刷新数据" : "Refresh")}
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 总营收卡片 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.totalRevenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {stats.revenueChange > 0 ? "+" : ""}{stats.revenueChange}% {t("admin.fromLastMonth")}
            </p>
          </CardContent>
        </Card>

        {/* 总订单卡片 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.totalOrders")}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">+{stats.totalOrders}</div>
            )}
            <p className="text-xs text-muted-foreground">
              +{stats.ordersChange}% {t("admin.fromLastMonth")}
            </p>
          </CardContent>
        </Card>

        {/* 活跃商品卡片 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.activeProducts")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">+{stats.activeProducts}</div>
            )}
            <p className="text-xs text-muted-foreground">
              +{stats.productsChange} {t("admin.newThisWeek")}
            </p>
          </CardContent>
        </Card>

        {/* 活跃用户卡片 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.activeUsers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">+{stats.activeUsers}</div>
            )}
            <p className="text-xs text-muted-foreground">
              +{stats.usersChange} {t("admin.inLastHour")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 图表和最近订单区域 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* 销售趋势图表 */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t("admin.salesTrend")}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesChart loading={loading} data={chartData} />
          </CardContent>
        </Card>

        {/* 最近订单列表 */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t("admin.recentOrders")}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {order.customerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {order.customerEmail || formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="ml-auto flex flex-col items-end gap-1">
                      <span className="font-medium text-sm">
                        {formatCurrency(order.totalAmount)}
                      </span>
                      {getOrderStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
