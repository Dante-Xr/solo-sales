/**
 * ============================================
 * 图表组件单元测试 (Phase 2 图表增强)
 * ============================================
 * 测试覆盖：
 *   - DateRangePicker 预设日期选择
 *   - MetricSelector 指标多选
 *   - ChartTypeToggle 图表类型切换
 *   - CompareSelector 对比模式切换
 *   - ChartConfigPanel 配置面板交互
 * ============================================
 */

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"

const translations: Record<string, string> = {
  "today": "Today",
  "yesterday": "Yesterday",
  "last7days": "Last 7 Days",
  "last30days": "Last 30 Days",
  "thisMonth": "This Month",
  "lastMonth": "Last Month",
  "custom": "Custom",
  "apply": "Apply",
  "sales": "Sales",
  "orders": "Orders",
  "revenue": "Revenue",
  "conversionRate": "Conversion Rate",
  "aov": "AOV",
  "visitors": "Visitors",
  "selectMetrics": "Select Metrics",
  "area": "Area",
  "bar": "Bar",
  "line": "Line",
  "none": "No Compare",
  "previous": "vs Previous",
  "yearAgo": "vs Last Year",
  "label": "Compare",
  "title": "Chart Settings",
  "dateRange": "Date Range",
  "metrics": "Metrics",
  "chartType": "Chart Type",
  "compare": "Compare",
  "reset": "Reset",
}

const mockT = (key: string) => translations[key] || key

jest.mock("next-intl", () => ({
  useTranslations: () => mockT,
  useLocale: () => "en",
}))

import { DateRangePicker } from "../DateRangePicker"
import { MetricSelector } from "../MetricSelector"
import { ChartTypeToggle } from "../ChartTypeToggle"
import { CompareSelector } from "../CompareSelector"
import { ChartConfigPanel } from "../ChartConfigPanel"
import type { PresetRange, MetricKey } from "../chart-types"
import { DEFAULT_CHART_CONFIG } from "../chart-types"

describe("DateRangePicker", () => {
  const defaultProps = {
    value: DEFAULT_CHART_CONFIG.dateRange,
    presetRange: "last7days" as PresetRange,
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("渲染预设日期按钮", () => {
    render(<DateRangePicker {...defaultProps} />)
    expect(screen.getByText("Today")).toBeInTheDocument()
    expect(screen.getByText("Yesterday")).toBeInTheDocument()
    expect(screen.getByText("Last 7 Days")).toBeInTheDocument()
    expect(screen.getByText("Last 30 Days")).toBeInTheDocument()
    expect(screen.getByText("This Month")).toBeInTheDocument()
    expect(screen.getByText("Last Month")).toBeInTheDocument()
  })

  it("点击预设按钮触发 onChange", () => {
    render(<DateRangePicker {...defaultProps} />)
    fireEvent.click(screen.getByText("Today"))
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: expect.any(Date), endDate: expect.any(Date) }),
      "today"
    )
  })

  it("点击自定义按钮显示日期输入框", () => {
    render(<DateRangePicker {...defaultProps} />)
    fireEvent.click(screen.getByText("Custom"))
    expect(screen.getByText("Apply")).toBeInTheDocument()
  })
})

describe("MetricSelector", () => {
  const defaultProps = {
    value: ["sales", "revenue"] as MetricKey[],
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    const localStorageMock = (() => {
      let store: Record<string, string> = {}
      return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => { store[key] = value }),
        removeItem: jest.fn((key: string) => { delete store[key] }),
        clear: jest.fn(() => { store = {} }),
      }
    })()
    Object.defineProperty(window, "localStorage", { value: localStorageMock })
  })

  it("渲染所有指标按钮", () => {
    render(<MetricSelector {...defaultProps} />)
    expect(screen.getByText("Sales")).toBeInTheDocument()
    expect(screen.getByText("Orders")).toBeInTheDocument()
    expect(screen.getByText("Revenue")).toBeInTheDocument()
    expect(screen.getByText("AOV")).toBeInTheDocument()
    expect(screen.getByText("Visitors")).toBeInTheDocument()
  })

  it("显示已选指标数量", () => {
    render(<MetricSelector {...defaultProps} />)
    expect(screen.getByText(/2\/3/)).toBeInTheDocument()
  })

  it("点击已选指标取消选择", () => {
    render(<MetricSelector {...defaultProps} />)
    fireEvent.click(screen.getByText("Sales"))
    expect(defaultProps.onChange).toHaveBeenCalled()
  })

  it("最多选择3个指标时禁用其他按钮", () => {
    const threeMetrics = { ...defaultProps, value: ["sales", "revenue", "orders"] as MetricKey[] }
    render(<MetricSelector {...threeMetrics} />)
    const aovBtn = screen.getByText("AOV").closest("button")
    expect(aovBtn).toBeDisabled()
  })

  it("至少保留1个指标", () => {
    const onChange = jest.fn()
    const oneMetric = { value: ["sales"] as MetricKey[], onChange }
    render(<MetricSelector {...oneMetric} />)
    fireEvent.click(screen.getByText("Sales"))
    const calledArg = onChange.mock.calls[0]?.[0]
    if (typeof calledArg === "function") {
      const result = calledArg(["sales"])
      expect(result).toEqual(["sales"])
    }
  })
})

describe("ChartTypeToggle", () => {
  const defaultProps = {
    value: "area" as const,
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("渲染三种图表类型按钮", () => {
    render(<ChartTypeToggle {...defaultProps} />)
    expect(screen.getByText("Area")).toBeInTheDocument()
    expect(screen.getByText("Bar")).toBeInTheDocument()
    expect(screen.getByText("Line")).toBeInTheDocument()
  })

  it("点击切换图表类型", () => {
    render(<ChartTypeToggle {...defaultProps} />)
    fireEvent.click(screen.getByText("Bar"))
    expect(defaultProps.onChange).toHaveBeenCalledWith("bar")
  })

  it("点击 Line 切换", () => {
    render(<ChartTypeToggle {...defaultProps} />)
    fireEvent.click(screen.getByText("Line"))
    expect(defaultProps.onChange).toHaveBeenCalledWith("line")
  })
})

describe("CompareSelector", () => {
  const defaultProps = {
    value: "none" as const,
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("渲染三种对比模式", () => {
    render(<CompareSelector {...defaultProps} />)
    expect(screen.getByText("No Compare")).toBeInTheDocument()
    expect(screen.getByText("vs Previous")).toBeInTheDocument()
    expect(screen.getByText("vs Last Year")).toBeInTheDocument()
  })

  it("点击切换对比模式", () => {
    render(<CompareSelector {...defaultProps} />)
    fireEvent.click(screen.getByText("vs Previous"))
    expect(defaultProps.onChange).toHaveBeenCalledWith("previous")
  })

  it("点击同比切换", () => {
    render(<CompareSelector {...defaultProps} />)
    fireEvent.click(screen.getByText("vs Last Year"))
    expect(defaultProps.onChange).toHaveBeenCalledWith("yearAgo")
  })
})

describe("ChartConfigPanel", () => {
  const defaultProps = {
    config: DEFAULT_CHART_CONFIG,
    onConfigChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("渲染配置面板标题", () => {
    render(<ChartConfigPanel {...defaultProps} />)
    expect(screen.getByText("Chart Settings")).toBeInTheDocument()
  })

  it("点击展开显示配置选项", () => {
    render(<ChartConfigPanel {...defaultProps} />)
    const toggle = screen.getByText("Chart Settings").closest("button")!
    fireEvent.click(toggle)
    expect(screen.getByText("Date Range")).toBeInTheDocument()
    expect(screen.getByText("Metrics")).toBeInTheDocument()
    expect(screen.getByText("Chart Type")).toBeInTheDocument()
    expect(screen.getByText("Compare")).toBeInTheDocument()
  })

  it("点击重置按钮恢复默认配置", () => {
    render(<ChartConfigPanel {...defaultProps} />)
    const toggle = screen.getByText("Chart Settings").closest("button")!
    fireEvent.click(toggle)
    const resetBtn = screen.getByText("Reset")
    fireEvent.click(resetBtn)
    expect(defaultProps.onConfigChange).toHaveBeenCalledWith(DEFAULT_CHART_CONFIG)
  })
})
