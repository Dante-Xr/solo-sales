/**
 * ============================================
 * 后台管理控制台页面 (Task 2.3)
 * ============================================
 * 功能说明：
 *   - 控制台数据展示（营收、订单、商品、用户）
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

  // 加载状态
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  /**
   * 获取控制台统计数据
   */
  const fetchDashboardStats = useCallback(async () => {
    try {
      // 并行请求多个 API
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        fetch("/api/orders").catch(() => ({ ok: false, json: async () => ({ success: false, data: [] }) })),
        fetch("/api/products").catch(() => ({ ok: false, json: async () => ({ success: false, data: [] }) })),
        fetch("/api/customers").catch(() => ({ ok: false, json: async () => ({ success: false, data: [] }) })),
      ])

      const [ordersData, productsData, usersData] = await Promise.all([
        ordersRes.json().catch(() => ({ success: false, data: [] })),
        productsRes.json().catch(() => ({ success: false, data: [] })),
        usersRes.json().catch(() => ({ success: false, data: [] })),
      ])

      // 计算统计数据
      const orders = ordersData.success ? ordersData.data.list || ordersData.data : []
      const products = productsData.success ? productsData.data.list || productsData.data : []
      const users = usersData.success ? usersData.data.list || usersData.data : []

      // 计算总收入
      const totalRevenue = orders.reduce((sum: number, order: { totalAmount?: number }) => {
        return sum + (order.totalAmount || 0)
      }, 0)

      // 计算统计数据
      setStats({
        totalRevenue,
        revenueChange: 20.1, // 模拟环比增长
        totalOrders: orders.length,
        ordersChange: 180.1,
        activeProducts: Array.isArray(products) ? products.length : 0,
        productsChange: 5,
        activeUsers: Array.isArray(users) ? users.length : 0,
        usersChange: 201,
      })

      // 处理最近订单（取最新的5条）
      const sortedOrders = Array.isArray(orders)
        ? [...orders].sort((a: { createdAt?: string }, b: { createdAt?: string }) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
            return dateB - dateA
          }).slice(0, 5)
        : []
      setRecentOrders(sortedOrders.map((order: { id: string; totalAmount?: number; status?: string; createdAt?: string; user?: { name?: string; email?: string } }) => ({
        id: order.id || "",
        customerName: order.user?.name || (isZh ? "游客" : "Guest"),
        customerEmail: order.user?.email || "",
        totalAmount: order.totalAmount || 0,
        status: order.status || "PENDING",
        createdAt: order.createdAt || new Date().toISOString(),
      })))
    } catch (error) {
      console.error("获取控制台数据失败:", error)
    }
  }, [isZh])

  /**
   * 初始加载数据
   */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchDashboardStats()
      setLoading(false)
    }
    loadData()
  }, [fetchDashboardStats])

  /**
   * 刷新数据
   */
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardStats()
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
        <h2 className="text-2xl font-bold tracking-tight">{t("admin.dashboard")}</h2>
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

        {/*活跃商品卡片 */}
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
            <SalesChart loading={loading} />
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
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {isZh ? "暂无订单" : "No orders yet"}
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center">
                    {/* 头像占位 */}
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="ml-4 space-y-1 flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {order.customerEmail || formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="ml-auto flex flex-col items-end gap-1">
                      <span className="font-medium text-sm">
                        +{formatCurrency(order.totalAmount)}
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