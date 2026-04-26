/**
 * ============================================
 * 图表配置面板组件 (Phase 2 图表增强)
 * ============================================
 * 功能说明：
 *   - 整合日期范围、指标选择、图表类型、对比选择
 *   - 可折叠/展开配置面板
 *   - 统一配置状态管理
 * ============================================
 */

"use client"

import { useState, useCallback } from "react"
import { Settings2, ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "./DateRangePicker"
import { MetricSelector } from "./MetricSelector"
import { ChartTypeToggle } from "./ChartTypeToggle"
import { CompareSelector } from "./CompareSelector"
import type { ChartConfig, DateRange, PresetRange, MetricKey, ChartType, CompareMode } from "./chart-types"
import { DEFAULT_CHART_CONFIG } from "./chart-types"

interface ChartConfigPanelProps {
  config: ChartConfig
  onConfigChange: (config: ChartConfig) => void
}

export function ChartConfigPanel({ config, onConfigChange }: ChartConfigPanelProps) {
  const t = useTranslations("admin.charts.config")
  const [isExpanded, setIsExpanded] = useState(false)

  const handleDateRangeChange = useCallback((range: DateRange, preset: PresetRange) => {
    onConfigChange({ ...config, dateRange: range, presetRange: preset })
  }, [config, onConfigChange])

  const handleMetricsChange = useCallback((updater: MetricKey[] | ((prev: MetricKey[]) => MetricKey[])) => {
    const newMetrics = typeof updater === "function" ? updater(config.metrics) : updater
    onConfigChange({ ...config, metrics: newMetrics })
  }, [config, onConfigChange])

  const handleChartTypeChange = useCallback((chartType: ChartType) => {
    onConfigChange({ ...config, chartType })
  }, [config, onConfigChange])

  const handleCompareModeChange = useCallback((compareMode: CompareMode) => {
    onConfigChange({ ...config, compareMode })
  }, [config, onConfigChange])

  const handleReset = useCallback(() => {
    onConfigChange(DEFAULT_CHART_CONFIG)
  }, [onConfigChange])

  return (
    <div className="border rounded-lg bg-card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          {t("title")}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("dateRange")}</label>
            <DateRangePicker
              value={config.dateRange}
              presetRange={config.presetRange}
              onChange={handleDateRangeChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("metrics")}</label>
            <MetricSelector value={config.metrics} onChange={handleMetricsChange} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("chartType")}</label>
              <ChartTypeToggle value={config.chartType} onChange={handleChartTypeChange} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("compare")}</label>
              <CompareSelector value={config.compareMode} onChange={handleCompareModeChange} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleReset}>
              {t("reset")}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
