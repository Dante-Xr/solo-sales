/**
 * ============================================
 * 销售趋势图表组件 (Phase 5 管理后台重构)
 * ============================================
 * 功能说明：
 *   - 展示 7天/30天 销售趋势面积图
 *   - 使用 Tremor AreaChart 替代 Recharts
 *   - 响应式设计
 *   - 支持暗色模式
 * ============================================
 * 2026-04-13: 从 Recharts 迁移到 Tremor AreaChart
 */

"use client"

import { useState, useEffect } from "react"
import { AreaChart } from "@tremor/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslations, useLocale } from "next-intl"

interface SalesData {
  date: string
  sales: number
  orders: number
  revenue: number
}

interface SalesChartProps {
  data?: SalesData[]
  loading?: boolean
}

export function SalesChart({ data: propData, loading: propLoading }: SalesChartProps) {
  const t = useTranslations('admin')
  const locale = useLocale()
  const [period, setPeriod] = useState<7 | 30>(7)
  const [data, setData] = useState<SalesData[]>(propData || [])
  const [loading, setLoading] = useState(propLoading ?? true)

  useEffect(() => {
    if (propData && propData.length > 0) {
      setData(propData)
      setLoading(false)
      return
    }

    const generateMockData = () => {
      const result: SalesData[] = []
      const today = new Date()

      for (let i = (period === 7 ? 6 : 29); i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)

        result.push({
          date: date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
            month: "short",
            day: "numeric",
          }),
          sales: Math.floor(Math.random() * 50) + 20,
          orders: Math.floor(Math.random() * 30) + 10,
          revenue: Math.floor(Math.random() * 2000) + 500,
        })
      }

      return result
    }

    setLoading(true)
    const timer = setTimeout(() => {
      setData(generateMockData())
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [period, locale])

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`
  }

  const chartData = data.map((d) => ({
    date: d.date,
    [t('sales')]: d.sales,
    [t('revenue')]: d.revenue,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {t('salesTrend')}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={period === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(7)}
            >
              {t('7days')}
            </Button>
            <Button
              variant={period === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(30)}
            >
              {t('30days')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading || propLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">
              {t('loading')}
            </div>
          </div>
        ) : (
          <AreaChart
            className="h-[300px] mt-4"
            data={chartData}
            index="date"
            categories={[t('sales'), t('revenue')]}
            colors={["blue", "green"]}
            yAxisWidth={48}
            valueFormatter={(value) =>
              typeof value === "number" && value > 100
                ? formatCurrency(value)
                : String(value)
            }
            showLegend={true}
            showAnimation={true}
          />
        )}

        {!loading && !propLoading && data.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {data.reduce((sum, d) => sum + d.sales, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('totalSales')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {data.reduce((sum, d) => sum + d.orders, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('totalOrders')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.reduce((sum, d) => sum + d.revenue, 0))}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('totalRevenue')}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}