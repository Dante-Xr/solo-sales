/**
 * ============================================
 * 分类销售占比图表组件 (Phase 2 图表增强)
 * ============================================
 * 功能说明：
 *   - 饼图/环形图展示各分类销售占比
 *   - 支持切换销售额/销量视图
 *   - 使用 Recharts PieChart 实现
 *   - 响应式设计，支持暗色模式
 * ============================================
 */

"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslations, useLocale } from "next-intl"

interface CategoryData {
  name: string
  revenue: number
  quantity: number
}

type ViewMode = "revenue" | "quantity"

interface CategoryPieChartProps {
  data?: CategoryData[]
  loading?: boolean
}

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#f43f5e", "#06b6d4"]

export function CategoryPieChart({ data: propData, loading: propLoading }: CategoryPieChartProps) {
  const t = useTranslations("admin.charts.categoryPie")
  const tAdmin = useTranslations("admin")
  const locale = useLocale()
  const [viewMode, setViewMode] = useState<ViewMode>("revenue")
  const [data, setData] = useState<CategoryData[]>(propData || [])
  const [loading, setLoading] = useState(propLoading ?? true)

  useEffect(() => {
    if (propData && propData.length > 0) {
      setData(propData)
      setLoading(false)
      return
    }

    const generateMockData = (): CategoryData[] => {
      const categories = locale === "zh"
        ? ["电子产品", "家居用品", "服饰配件", "美妆护肤", "运动户外", "食品饮料"]
        : ["Electronics", "Home & Living", "Fashion", "Beauty", "Sports", "Food & Drink"]

      return categories.map((name) => ({
        name,
        revenue: Math.floor(Math.random() * 10000) + 1000,
        quantity: Math.floor(Math.random() * 500) + 50,
      }))
    }

    setLoading(true)
    const timer = setTimeout(() => {
      setData(generateMockData())
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [locale])

  const chartData = data.map((item) => ({
    name: item.name,
    value: item[viewMode],
  }))

  const formatValue = (value: number) => {
    if (viewMode === "revenue") return `$${value.toLocaleString()}`
    return String(value)
  }

  const total = data.reduce((sum, item) => sum + item[viewMode], 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "revenue" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("revenue")}
            >
              {t("revenue")}
            </Button>
            <Button
              variant={viewMode === "quantity" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("quantity")}
            >
              {t("quantity")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading || propLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">{tAdmin("loading")}</div>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart className="mt-4">
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: unknown) => formatValue(Number(value ?? 0))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {data.map((item, i) => {
                const percent = total > 0 ? ((item[viewMode] / total) * 100).toFixed(1) : "0"
                return (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatValue(item[viewMode])}</span>
                      <span className="text-muted-foreground">({percent}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
