/**
 * ============================================
 * 商品销售排行图表组件 (Phase 2 图表增强)
 * ============================================
 * 功能说明：
 *   - 水平柱状图展示 Top 10 商品
 *   - 支持按销售额/销量排序
 *   - 响应式设计，支持暗色模式
 * ============================================
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { BarChart } from "@tremor/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslations, useLocale } from "next-intl"

interface TopProduct {
  name: string
  revenue: number
  quantity: number
}

type SortBy = "revenue" | "quantity"

interface TopProductsChartProps {
  data?: TopProduct[]
  loading?: boolean
}

export function TopProductsChart({ data: propData, loading: propLoading }: TopProductsChartProps) {
  const t = useTranslations("admin.charts.topProducts")
  const tAdmin = useTranslations("admin")
  const locale = useLocale()
  const [sortBy, setSortBy] = useState<SortBy>("revenue")
  const [data, setData] = useState<TopProduct[]>(propData || [])
  const [loading, setLoading] = useState(propLoading ?? true)

  useEffect(() => {
    if (propData && propData.length > 0) {
      setData(propData)
      setLoading(false)
      return
    }

    const generateMockData = (): TopProduct[] => {
      const names = locale === "zh"
        ? ["智能手表", "无线耳机", "手机壳", "充电宝", "蓝牙音箱", "数据线", "屏幕保护膜", "平板支架", "键盘", "鼠标"]
        : ["Smart Watch", "Wireless Earbuds", "Phone Case", "Power Bank", "BT Speaker", "USB Cable", "Screen Protector", "Tablet Stand", "Keyboard", "Mouse"]

      return names.map((name) => ({
        name,
        revenue: Math.floor(Math.random() * 5000) + 500,
        quantity: Math.floor(Math.random() * 200) + 20,
      }))
    }

    setLoading(true)
    const timer = setTimeout(() => {
      setData(generateMockData())
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [locale])

  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b[sortBy] - a[sortBy])
    return sorted.slice(0, 10).map((item) => ({
      name: item.name.length > 12 ? item.name.slice(0, 12) + "..." : item.name,
      [t("revenue")]: item.revenue,
      [t("quantity")]: item.quantity,
    }))
  }, [data, sortBy, t])

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={sortBy === "revenue" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("revenue")}
            >
              {t("revenue")}
            </Button>
            <Button
              variant={sortBy === "quantity" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("quantity")}
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
          <BarChart
            className="h-[300px] mt-4"
            data={chartData}
            index="name"
            categories={[sortBy === "revenue" ? t("revenue") : t("quantity")]}
            colors={[sortBy === "revenue" ? "blue" : "violet"]}
            yAxisWidth={80}
            layout="vertical"
            valueFormatter={sortBy === "revenue" ? formatCurrency : (v) => String(v)}
            showLegend={false}
            showAnimation={true}
          />
        )}
      </CardContent>
    </Card>
  )
}
