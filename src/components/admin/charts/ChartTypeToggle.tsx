/**
 * ============================================
 * 图表类型切换组件 (Phase 2 图表增强)
 * ============================================
 * 功能说明：
 *   - 支持面积图/柱状图/折线图切换
 *   - 切换动画流畅
 *   - 响应式适配
 * ============================================
 */

"use client"

import { useTranslations } from "next-intl"
import { AreaChart, BarChart3, LineChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ChartType } from "./chart-types"

interface ChartTypeToggleProps {
  value: ChartType
  onChange: (type: ChartType) => void
}

const CHART_TYPE_ICONS: Record<ChartType, React.ElementType> = {
  area: AreaChart,
  bar: BarChart3,
  line: LineChart,
}

export function ChartTypeToggle({ value, onChange }: ChartTypeToggleProps) {
  const t = useTranslations("admin.charts.chartType")

  const types: ChartType[] = ["area", "bar", "line"]

  return (
    <div className="flex gap-1">
      {types.map((type) => {
        const Icon = CHART_TYPE_ICONS[type]
        const isActive = value === type
        return (
          <Button
            key={type}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange(type)}
            className="gap-1.5"
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{t(type)}</span>
          </Button>
        )
      })}
    </div>
  )
}
