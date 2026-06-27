"use client"

/**
 * ============================================
 * 数据分析仪表盘组件 (v0.6.0)
 * ============================================
 */

import { useState, useEffect, useCallback } from "react"
import { TimeRange } from "@/lib/analytics/types"

interface OverviewData {
  overview: {
    totalRevenue: number
    totalOrders: number
    totalVisitors: number
    newCustomers: number
    avgOrderValue: number
    conversionRate: number
    revenueGrowth: number
    ordersGrowth: number
    topProducts: Array<{
      productId: string
      productName: string
      image: string
      salesCount: number
      salesAmount: number
    }>
  }
  trends: Array<{
    date: string
    revenue: number
    orders: number
    visitors: number
  }>
  customers: {
    totalCustomers: number
    newCustomers: number
    returningCustomers: number
    customerLTV: number
  }
  products: {
    totalProducts: number
    activeProducts: number
    outOfStockProducts: number
  }
  period: {
    label: string
    start: string
    end: string
  }
}

interface AnalyticsDashboardProps {
  locale?: "zh" | "en"
}

const LABELS = {
  zh: {
    title: "数据分析",
    revenue: "总收入",
    orders: "订单数",
    visitors: "访客数",
    newCustomers: "新客户",
    avgOrderValue: "平均订单额",
    conversionRate: "转化率",
    topProducts: "热销商品",
    period: "时间范围",
    today: "今天",
    last7Days: "最近7天",
    last30Days: "最近30天",
    last90Days: "最近90天",
    totalCustomers: "总客户数",
    returningCustomers: "回头客",
    customerLTV: "客户终身价值",
    activeProducts: "活跃商品",
    outOfStock: "缺货商品"
  },
  en: {
    title: "Analytics Dashboard",
    revenue: "Revenue",
    orders: "Orders",
    visitors: "Visitors",
    newCustomers: "New Customers",
    avgOrderValue: "Avg Order Value",
    conversionRate: "Conversion Rate",
    topProducts: "Top Products",
    period: "Time Period",
    today: "Today",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    last90Days: "Last 90 Days",
    totalCustomers: "Total Customers",
    returningCustomers: "Returning",
    customerLTV: "Customer LTV",
    activeProducts: "Active Products",
    outOfStock: "Out of Stock"
  }
}

export default function AnalyticsDashboard({ locale = "zh" }: AnalyticsDashboardProps) {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")
  const [error, setError] = useState<string | null>(null)
  const t = LABELS[locale]

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/analytics/overview?timeRange=${timeRange}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
      style: "currency",
      currency: locale === "zh" ? "CNY" : "USD",
      minimumFractionDigits: 2
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US").format(value)
  }

  const _formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Error</p>
        <p>{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* 标题和时间范围选择 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>

        <div className="flex gap-2">
          {(["today", "7d", "30d", "90d"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {range === "today" ? t.today : range === "7d" ? t.last7Days : range === "30d" ? t.last30Days : t.last90Days}
            </button>
          ))}
        </div>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.revenue}
          value={formatCurrency(data.overview.totalRevenue)}
          trend={data.overview.revenueGrowth}
          icon="💰"
        />
        <StatCard
          title={t.orders}
          value={formatNumber(data.overview.totalOrders)}
          trend={data.overview.ordersGrowth}
          icon="📦"
        />
        <StatCard
          title={t.visitors}
          value={formatNumber(data.customers.totalCustomers)}
          trend={0}
          icon="👥"
        />
        <StatCard
          title={t.newCustomers}
          value={formatNumber(data.customers.newCustomers)}
          trend={0}
          icon="🆕"
        />
      </div>

      {/* 中间指标 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">{t.avgOrderValue}</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(data.overview.avgOrderValue)}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">{t.customerLTV}</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(data.customers.customerLTV)}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">{t.activeProducts}</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(data.products.activeProducts)}
            <span className="text-sm font-normal text-gray-500 ml-2">
              / {formatNumber(data.products.outOfStockProducts)} {t.outOfStock}
            </span>
          </div>
        </div>
      </div>

      {/* 热销商品 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.topProducts}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 font-medium text-right">Sales</th>
                <th className="pb-3 font-medium text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.overview.topProducts.slice(0, 5).map((product, index) => (
                <tr key={product.productId} className="border-b border-gray-50">
                  <td className="py-3 text-gray-500">{index + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.productName}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <span className="font-medium text-gray-900">{product.productName}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-gray-700">{formatNumber(product.salesCount)}</td>
                  <td className="py-3 text-right font-medium text-gray-900">
                    {formatCurrency(product.salesAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 时间范围标签 */}
      <div className="text-sm text-gray-500 text-center">
        {t.period}: {data.period.label}
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  trend: number
  icon: string
}

function StatCard({ title, value, trend, icon }: StatCardProps) {
  const trendColor = trend > 0 ? "text-success" : trend < 0 ? "text-destructive" : "text-muted-foreground"
  const trendIcon = trend > 0 ? "↑" : trend < 0 ? "↓" : ""

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend !== 0 && (
          <span className={`text-sm font-medium ${trendColor}`}>
            {trendIcon} {Math.abs(trend * 100).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  )
}
