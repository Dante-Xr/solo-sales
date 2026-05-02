/**
 * 修改时间：2026-05-02 21:19:13 +08:00
 * 修改内容：清理图表类型测试中未使用的类型导入，推进 M5 lint warnings 收敛。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 图表类型定义单元测试 (Phase 2 图表增强)
 * ============================================
 * 测试覆盖：
 *   - 类型常量正确性
 *   - 默认配置完整性
 *   - 指标颜色映射
 * ============================================
 */

import { METRIC_COLORS, DEFAULT_CHART_CONFIG } from "../chart-types"
import type { MetricKey } from "../chart-types"

describe("chart-types", () => {
  describe("METRIC_COLORS", () => {
    it("包含所有指标的颜色映射", () => {
      const metrics: MetricKey[] = ["sales", "orders", "revenue", "conversionRate", "aov", "visitors"]
      metrics.forEach((metric) => {
        expect(METRIC_COLORS[metric]).toBeDefined()
        expect(typeof METRIC_COLORS[metric]).toBe("string")
      })
    })

    it("每个指标颜色都是有效的 Tremor 颜色", () => {
      const validColors = ["blue", "violet", "green", "amber", "rose", "cyan"]
      Object.values(METRIC_COLORS).forEach((color) => {
        expect(validColors).toContain(color)
      })
    })
  })

  describe("DEFAULT_CHART_CONFIG", () => {
    it("包含完整的配置字段", () => {
      expect(DEFAULT_CHART_CONFIG).toHaveProperty("dateRange")
      expect(DEFAULT_CHART_CONFIG).toHaveProperty("presetRange")
      expect(DEFAULT_CHART_CONFIG).toHaveProperty("metrics")
      expect(DEFAULT_CHART_CONFIG).toHaveProperty("chartType")
      expect(DEFAULT_CHART_CONFIG).toHaveProperty("compareMode")
    })

    it("dateRange 包含 startDate 和 endDate", () => {
      expect(DEFAULT_CHART_CONFIG.dateRange.startDate).toBeInstanceOf(Date)
      expect(DEFAULT_CHART_CONFIG.dateRange.endDate).toBeInstanceOf(Date)
    })

    it("默认预设为 last7days", () => {
      expect(DEFAULT_CHART_CONFIG.presetRange).toBe("last7days")
    })

    it("默认指标为 sales 和 revenue", () => {
      expect(DEFAULT_CHART_CONFIG.metrics).toEqual(["sales", "revenue"])
    })

    it("默认图表类型为 area", () => {
      expect(DEFAULT_CHART_CONFIG.chartType).toBe("area")
    })

    it("默认对比模式为 none", () => {
      expect(DEFAULT_CHART_CONFIG.compareMode).toBe("none")
    })

    it("指标数量不超过3个", () => {
      expect(DEFAULT_CHART_CONFIG.metrics.length).toBeLessThanOrEqual(3)
    })
  })
})
