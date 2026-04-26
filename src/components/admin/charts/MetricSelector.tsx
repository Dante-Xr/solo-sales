/**
 * ============================================
 * 指标选择器组件 (Phase 2 图表增强)
 * ============================================
 * 功能说明：
 *   - 支持多选指标（最多3个）
 *   - 指标颜色区分
 *   - 选择状态持久化到 localStorage
 *   - 实时图表更新
 * ============================================
 */

"use client"

import { useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import type { MetricKey } from "./chart-types"
import { METRIC_COLORS } from "./chart-types"

const STORAGE_KEY = "solo_sales_chart_metrics"

const ALL_METRICS: MetricKey[] = ["sales", "orders", "revenue", "conversionRate", "aov", "visitors"]
const MAX_METRICS = 3

interface MetricSelectorProps {
  value: MetricKey[]
  onChange: (metrics: MetricKey[]) => void
}

export function MetricSelector({ value, onChange }: MetricSelectorProps) {
  const t = useTranslations("admin.charts.metrics")

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {}
  }, [value])

  const handleToggle = useCallback((metric: MetricKey) => {
    onChange((prev: MetricKey[]) => {
      if (prev.includes(metric)) {
        if (prev.length <= 1) return prev
        return prev.filter((m) => m !== metric)
      }
      if (prev.length >= MAX_METRICS) return prev
      return [...prev, metric]
    })
  }, [onChange])

  const getMetricLabel = (key: MetricKey): string => {
    const labels: Record<MetricKey, string> = {
      sales: t("sales"),
      orders: t("orders"),
      revenue: t("revenue"),
      conversionRate: t("conversionRate"),
      aov: t("aov"),
      visitors: t("visitors"),
    }
    return labels[key]
  }

  const getMetricColorClass = (key: MetricKey): string => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700",
      violet: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300 border-violet-300 dark:border-violet-700",
      green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-700",
      amber: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700",
      rose: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-700",
      cyan: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700",
    }
    return colorMap[METRIC_COLORS[key]] || "bg-gray-100 text-gray-800 border-gray-300"
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">
        {t("selectMetrics")} ({value.length}/{MAX_METRICS})
      </div>
      <div className="flex flex-wrap gap-2">
        {ALL_METRICS.map((metric) => {
          const isSelected = value.includes(metric)
          const isDisabled = !isSelected && value.length >= MAX_METRICS
          return (
            <Button
              key={metric}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              disabled={isDisabled}
              onClick={() => handleToggle(metric)}
              className={isSelected ? getMetricColorClass(metric) : ""}
            >
              {getMetricLabel(metric)}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export function loadSavedMetrics(): MetricKey[] | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.length <= MAX_METRICS) {
        return parsed
      }
    }
  } catch {}
  return null
}
