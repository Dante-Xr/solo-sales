/**
 * ============================================
 * 销售趋势图表组件 (Task 2.2)
 * ============================================
 * 功能说明：
 *   - 展示 7天/30天 销售趋势折线图
 *   - 使用 Recharts 库绘制
 *   - 响应式设计
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
import { useLanguage } from "@/context/LanguageContext"

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
  const { language } = useLanguage()
  const isZh = language === "zh"
  const [period, setPeriod] = useState<7 | 30>(7)
  const [data, setData] = useState<SalesData[]>([])
  const [loading, setLoading] = useState(true)

  // 模拟销售数据
  useEffect(() => {
    if (propData) {
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
          date: date.toLocaleDateString(isZh ? "zh-CN" : "en-US", {
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
    setTimeout(() => {
      setData(generateMockData())
      setLoading(false)
    }, 500)
  }, [period, isZh, propData])

  // 格式化货币
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`
  }

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean
    payload?: Array<{ name: string; value: number; color: string }>
    label?: string
  }) => {
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
                {entry.name === "sales" ? (isZh ? "销量" : "Sales") + ":" : ""}
              </span>
              <span className="font-medium">
                {entry.name === "revenue"
                  ? formatCurrency(entry.value)
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {isZh ? "销售趋势" : "Sales Trend"}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={period === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(7)}
            >
              {isZh ? "7天" : "7 Days"}
            </Button>
            <Button
              variant={period === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(30)}
            >
              {isZh ? "30天" : "30 Days"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading || propLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">
              {isZh ? "加载中..." : "Loading..."}
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
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) =>
                  value === "sales"
                    ? (isZh ? "销量" : "Sales")
                    : value === "revenue"
                      ? (isZh ? "收入" : "Revenue")
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
                {isZh ? "总销量" : "Total Sales"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {data.reduce((sum, d) => sum + d.orders, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {isZh ? "总订单" : "Total Orders"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.reduce((sum, d) => sum + d.revenue, 0))}
              </div>
              <div className="text-sm text-muted-foreground">
                {isZh ? "总收入" : "Total Revenue"}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}