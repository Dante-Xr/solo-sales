/**
 * ============================================
 * 后台管理控制台页面 (Phase 5 管理后台重构)
 * ============================================
 * 功能说明：
 *   - 使用聚合 Dashboard API，单次请求获取所有数据
 *   - 使用 Refine useCustom hook 获取数据
 *   - 集成 Tremor KPI 卡片组件
 *   - 集成 Tremor AreaChart 销售趋势图表
 *   - 最近订单列表
 * ============================================
 * 2026-04-13: 集成 Refine + Tremor 组件
 * 2026-04-13 23:50: 迁移到 Refine useCustom hook
 */

"use client"

import { useState, useMemo } from "react"
import { useCustom } from "@refinedev/core"
import { DollarSign, Package, ShoppingCart, Users, RefreshCw } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { SalesChart } from "@/components/admin/SalesChart"
import { KpiGrid } from "@/components/admin/KpiCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
  const t = useTranslations('admin')
  const locale = useLocale()
  const isZh = locale === "zh"

  const { query: { data: dashboardResponse, isLoading: loading, refetch, isRefetching } } = useCustom({
    url: "/api/admin/dashboard",
    method: "get",
    queryOptions: {
      enabled: true,
    },
  })

  const dashboardData = useMemo<DashboardData | null>(() => {
    const result = dashboardResponse?.data as any
    if (result?.success && result?.data) {
      return result.data
    }
    return null
  }, [dashboardResponse])

  const fromCache = useMemo(() => {
    const result = dashboardResponse?.data as any
    return result?.fromCache || false
  }, [dashboardResponse])

  const stats = dashboardData?.stats || {
    totalRevenue: 0, revenueChange: 0,
    totalOrders: 0, ordersChange: 0,
    activeProducts: 0, productsChange: 0,
    activeUsers: 0, usersChange: 0,
  }

  const recentOrders = dashboardData?.recentOrders || []
  const chartData = dashboardData?.chartData || []

  const handleRefresh = () => {
    refetch()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(isZh ? "zh-CN" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getOrderStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      PENDING: { color: "bg-yellow-500", label: t('orderStatus.pending') || "待处理" },
      PAID: { color: "bg-blue-500", label: t('orderStatus.paid') || "已支付" },
      SHIPPED: { color: "bg-purple-500", label: t('orderStatus.shipped') || "已发货" },
      DELIVERED: { color: "bg-green-500", label: t('orderStatus.delivered') || "已完成" },
      CANCELLED: { color: "bg-red-500", label: t('orderStatus.cancelled') || "已取消" },
    }
    const { color, label } = config[status] || { color: "bg-gray-500", label: status }
    return (
      <span className={`${color} text-white text-xs px-2 py-0.5 rounded-full`}>
        {label}
      </span>
    )
  }

  const getDeltaType = (change: number): "increase" | "decrease" | "unchanged" => {
    if (change > 0) return "increase"
    if (change < 0) return "decrease"
    return "unchanged"
  }

  const kpiCards = [
    {
      title: t("totalRevenue"),
      value: loading ? "..." : formatCurrency(stats.totalRevenue),
      delta: `${stats.revenueChange > 0 ? "+" : ""}${stats.revenueChange}%`,
      deltaType: getDeltaType(stats.revenueChange) as "increase" | "decrease" | "unchanged",
      icon: DollarSign,
    },
    {
      title: t("totalOrders"),
      value: loading ? "..." : String(stats.totalOrders),
      delta: `${stats.ordersChange > 0 ? "+" : ""}${stats.ordersChange}%`,
      deltaType: getDeltaType(stats.ordersChange) as "increase" | "decrease" | "unchanged",
      icon: ShoppingCart,
    },
    {
      title: t("activeProducts"),
      value: loading ? "..." : String(stats.activeProducts),
      delta: `+${stats.productsChange}`,
      deltaType: getDeltaType(stats.productsChange) as "increase" | "decrease" | "unchanged",
      icon: Package,
    },
    {
      title: t("activeUsers"),
      value: loading ? "..." : String(stats.activeUsers),
      delta: `+${stats.usersChange}`,
      deltaType: getDeltaType(stats.usersChange) as "increase" | "decrease" | "unchanged",
      icon: Users,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">{t("dashboard")}</h2>
          {fromCache && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {isZh ? "缓存" : "Cached"}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
          {isRefetching ? t('updating') : t('refreshData') || (isZh ? "刷新数据" : "Refresh")}
        </Button>
      </div>

      <KpiGrid cards={kpiCards} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t("salesTrend")}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesChart loading={loading} data={chartData} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t("recentOrders")}</CardTitle>
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
