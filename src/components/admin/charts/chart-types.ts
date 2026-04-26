/**
 * ============================================
 * 图表共享类型定义 (Phase 2 图表增强)
 * ============================================
 * 功能说明：
 *   - 定义图表相关的共享类型和接口
 *   - 统一图表配置参数类型
 *   - 统一数据结构类型
 * ============================================
 */

export type ChartType = "area" | "bar" | "line"

export type CompareMode = "none" | "previous" | "yearAgo"

export type MetricKey = "sales" | "orders" | "revenue" | "conversionRate" | "aov" | "visitors"

export interface DateRange {
  startDate: Date
  endDate: Date
}

export type PresetRange = "today" | "yesterday" | "last7days" | "last30days" | "thisMonth" | "lastMonth" | "custom"

export interface ChartConfig {
  dateRange: DateRange
  presetRange: PresetRange
  metrics: MetricKey[]
  chartType: ChartType
  compareMode: CompareMode
}

export interface MetricOption {
  key: MetricKey
  label: string
  color: string
}

export const METRIC_COLORS: Record<MetricKey, string> = {
  sales: "blue",
  orders: "violet",
  revenue: "green",
  conversionRate: "amber",
  aov: "rose",
  visitors: "cyan",
}

export const DEFAULT_CHART_CONFIG: ChartConfig = {
  dateRange: {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  },
  presetRange: "last7days",
  metrics: ["sales", "revenue"],
  chartType: "area",
  compareMode: "none",
}
