/**
 * 修改时间：2026-05-02 21:19:13 +08:00
 * 修改内容：清理销售图表未使用的 ChartType 类型导入，推进 M5 lint warnings 收敛。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 销售趋势图表组件 (Phase 2 图表增强 - 重构)
 * ============================================
 * 功能说明：
 *   - 支持面积图/柱状图/折线图切换
 *   - 支持自定义日期范围
 *   - 支持多指标选择（最多3个）
 *   - 支持同比/环比对比
 *   - 使用 Tremor + Recharts 补充
 *   - 响应式设计，支持暗色模式
 * ============================================
 * 2026-04-24: Phase 2 重构，增加图表配置功能
 */

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { AreaChart as TremorAreaChart, BarChart as TremorBarChart } from "@tremor/react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations, useLocale } from "next-intl"
import { ChartConfigPanel } from "./ChartConfigPanel"
import { loadSavedMetrics } from "./MetricSelector"
import type { ChartConfig, MetricKey } from "./chart-types"
import { DEFAULT_CHART_CONFIG, METRIC_COLORS } from "./chart-types"

interface SalesData {
  date: string
  sales: number
  orders: number
  revenue: number
  conversionRate: number
  aov: number
  visitors: number
}

interface CompareData {
  date: string
  [key: string]: number | string
}

interface SalesChartProps {
  data?: SalesData[]
  compareData?: CompareData[]
  loading?: boolean
}

const RECHARTS_COLORS: Record<string, string> = {
  blue: "#3b82f6",
  violet: "#8b5cf6",
  green: "#22c55e",
  amber: "#f59e0b",
  rose: "#f43f5e",
  cyan: "#06b6d4",
}

export function SalesChart({ data: propData, compareData: propCompareData, loading: propLoading }: SalesChartProps) {
  const t = useTranslations("admin.charts")
  const tAdmin = useTranslations("admin")
  const locale = useLocale()

  const savedMetrics = useMemo(() => loadSavedMetrics(), [])
  const [config, setConfig] = useState<ChartConfig>({
    ...DEFAULT_CHART_CONFIG,
    metrics: savedMetrics || DEFAULT_CHART_CONFIG.metrics,
  })
  const [data, setData] = useState<SalesData[]>(propData || [])
  const [compareData, setCompareData] = useState<CompareData[]>(propCompareData || [])
  const [loading, setLoading] = useState(propLoading ?? true)

  useEffect(() => {
    if (propData && propData.length > 0) {
      setData(propData)
      setLoading(false)
      return
    }

    const generateMockData = () => {
      const result: SalesData[] = []
      const start = config.dateRange.startDate
      const end = config.dateRange.endDate
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

      for (let i = 0; i < days; i++) {
        const date = new Date(start)
        date.setDate(date.getDate() + i)

        result.push({
          date: date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
            month: "short",
            day: "numeric",
          }),
          sales: Math.floor(Math.random() * 50) + 20,
          orders: Math.floor(Math.random() * 30) + 10,
          revenue: Math.floor(Math.random() * 2000) + 500,
          conversionRate: +(Math.random() * 5 + 1).toFixed(1),
          aov: Math.floor(Math.random() * 50) + 30,
          visitors: Math.floor(Math.random() * 500) + 100,
        })
      }

      return result
    }

    const generateCompareData = () => {
      if (config.compareMode === "none") return []

      const result: CompareData[] = []
      const start = config.dateRange.startDate
      const end = config.dateRange.endDate
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

      for (let i = 0; i < days; i++) {
        const date = new Date(start)
        date.setDate(date.getDate() + i)

        const entry: CompareData = {
          date: date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
            month: "short",
            day: "numeric",
          }),
        }

        config.metrics.forEach((metric) => {
          const baseValues: Record<MetricKey, number> = {
            sales: Math.floor(Math.random() * 40) + 15,
            orders: Math.floor(Math.random() * 25) + 8,
            revenue: Math.floor(Math.random() * 1500) + 400,
            conversionRate: +(Math.random() * 4 + 0.5).toFixed(1),
            aov: Math.floor(Math.random() * 40) + 25,
            visitors: Math.floor(Math.random() * 400) + 80,
          }
          entry[`${metric}_compare`] = baseValues[metric]
        })

        result.push(entry)
      }

      return result
    }

    setLoading(true)
    const timer = setTimeout(() => {
      setData(generateMockData())
      setCompareData(generateCompareData())
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [config.dateRange, config.compareMode, config.metrics, locale])

  const getMetricLabel = useCallback((key: MetricKey): string => {
    const labels: Record<MetricKey, string> = {
      sales: tAdmin("sales"),
      orders: tAdmin("totalOrders"),
      revenue: tAdmin("revenue"),
      conversionRate: t("metrics.conversionRate"),
      aov: t("metrics.aov"),
      visitors: t("metrics.visitors"),
    }
    return labels[key]
  }, [t, tAdmin])

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`

  const mergedData = useMemo(() => {
    if (config.compareMode === "none" || compareData.length === 0) {
      return data.map((d) => {
        const entry: Record<string, string | number> = { date: d.date }
        config.metrics.forEach((metric) => {
          entry[getMetricLabel(metric)] = d[metric]
        })
        return entry
      })
    }

    return data.map((d, i) => {
      const entry: Record<string, string | number> = { date: d.date }
      config.metrics.forEach((metric) => {
        entry[getMetricLabel(metric)] = d[metric]
        if (compareData[i]) {
          entry[`${getMetricLabel(metric)} (${t("compare.label")})`] = compareData[i][`${metric}_compare`] || 0
        }
      })
      return entry
    })
  }, [data, compareData, config.metrics, config.compareMode, getMetricLabel, t])

  const categories = useMemo(() => {
    const cats = config.metrics.map((m) => getMetricLabel(m))
    if (config.compareMode !== "none" && compareData.length > 0) {
      config.metrics.forEach((m) => {
        cats.push(`${getMetricLabel(m)} (${t("compare.label")})`)
      })
    }
    return cats
  }, [config.metrics, config.compareMode, compareData, getMetricLabel, t])

  const colors = useMemo(() => {
    const base = config.metrics.map((m) => METRIC_COLORS[m])
    if (config.compareMode !== "none" && compareData.length > 0) {
      config.metrics.forEach((m) => {
        base.push(METRIC_COLORS[m])
      })
    }
    return base
  }, [config.metrics, config.compareMode, compareData])

  const valueFormatter = (value: number) => {
    if (value > 100) return formatCurrency(value)
    if (value < 10) return `${value}%`
    return String(value)
  }

  const renderTremorChart = () => {
    if (config.chartType === "bar") {
      return (
        <TremorBarChart
          className="h-[300px] mt-4"
          data={mergedData}
          index="date"
          categories={categories}
          colors={colors}
          yAxisWidth={48}
          valueFormatter={valueFormatter}
          showLegend={true}
          showAnimation={true}
          stack={config.compareMode !== "none"}
        />
      )
    }

    return (
      <TremorAreaChart
        className="h-[300px] mt-4"
        data={mergedData}
        index="date"
        categories={categories}
        colors={colors}
        yAxisWidth={48}
        valueFormatter={valueFormatter}
        showLegend={true}
        showAnimation={true}
      />
    )
  }

  const renderRechartsLine = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={mergedData} className="mt-4">
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis width={48} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: unknown) => valueFormatter(Number(value ?? 0))}
            contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
          />
          <Legend />
          {config.metrics.map((metric) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={getMetricLabel(metric)}
              stroke={RECHARTS_COLORS[METRIC_COLORS[metric]]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
          {config.compareMode !== "none" && compareData.length > 0 && config.metrics.map((metric) => (
            <Line
              key={`${metric}-compare`}
              type="monotone"
              dataKey={`${getMetricLabel(metric)} (${t("compare.label")})`}
              stroke={RECHARTS_COLORS[METRIC_COLORS[metric]]}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const summaryStats = useMemo(() => {
    if (data.length === 0) return null

    const totals: Record<MetricKey, number> = {
      sales: 0,
      orders: 0,
      revenue: 0,
      conversionRate: 0,
      aov: 0,
      visitors: 0,
    }

    data.forEach((d) => {
      config.metrics.forEach((metric) => {
        totals[metric] += d[metric]
      })
    })

    if (config.metrics.includes("conversionRate")) {
      totals.conversionRate = +(totals.conversionRate / data.length).toFixed(1)
    }

    return totals
  }, [data, config.metrics])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {tAdmin("salesTrend")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartConfigPanel config={config} onConfigChange={setConfig} />

        {loading || propLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">
              {tAdmin("loading")}
            </div>
          </div>
        ) : config.chartType === "line" ? (
          renderRechartsLine()
        ) : (
          renderTremorChart()
        )}

        {!loading && !propLoading && summaryStats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            {config.metrics.map((metric) => (
              <div key={metric} className="text-center">
                <div className="text-2xl font-bold">
                  {metric === "revenue" || metric === "aov"
                    ? formatCurrency(summaryStats[metric])
                    : metric === "conversionRate"
                      ? `${summaryStats[metric]}%`
                      : summaryStats[metric].toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {getMetricLabel(metric)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
