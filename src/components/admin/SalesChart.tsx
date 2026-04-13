/**
 * ============================================
 * 销售趋势图表组件 (Task 2.2)
 * ============================================
 * 功能说明：
 *   - 展示 7天/30天 销售趋势折线图
 *   - 使用 Recharts 库绘制
 *   - 响应式设计
 *   - 2026-04-13: 更新为使用 next-intl 国际化
 * ============================================
 */

"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
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

interface TooltipPayload {
  name: string
  value: number
  color: string
}

function CustomTooltip({
  active,
  payload,
  label,
  t
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
  t: ReturnType<typeof useTranslations>
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">
              {entry.name === "sales" ? t('sales') + ":" : ""}
            </span>
            <span className="font-medium">
              {entry.name === "revenue"
                ? `$${entry.value.toLocaleString()}`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function SalesChart({ data: propData, loading: propLoading }: SalesChartProps) {
  const t = useTranslations('admin')
  const locale = useLocale()
  const [period, setPeriod] = useState<7 | 30>(7)
  const [data, setData] = useState<SalesData[]>(propData || [])
  const [loading, setLoading] = useState(propLoading ?? true)

  // 模拟销售数据
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

  // 格式化货币
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`
  }

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
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                tickFormatter={(value) => `${value}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip t={t} />} />
              <Legend
                formatter={(value) =>
                  value === "sales"
                    ? t('sales')
                    : value === "revenue"
                      ? t('revenue')
                      : value
                }
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sales"
                name="sales"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* 统计摘要 */}
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
