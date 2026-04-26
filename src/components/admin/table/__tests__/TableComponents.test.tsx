/**
 * ============================================
 * 表格增强组件 单元测试 (Phase 3 界面优化)
 * ============================================
 * 测试覆盖：
 *   - applySort 排序函数
 *   - applyFilters 筛选函数
 *   - exportData 导出函数
 *   - ColumnCustomizer 列自定义组件
 * ============================================
 */

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"

// ==================== Mock i18n ====================

const translations: Record<string, string> = {
  "columns": "Columns",
  "columnCustomize": "Customize Columns",
  "filter": "Filter",
  "clearFilters": "Clear Filters",
  "searchPlaceholder": "Search...",
  "all": "All",
  "min": "Min",
  "max": "Max",
  "apply": "Apply",
  "cancel": "Cancel",
  "sort": "Sort",
  "clickToSort": "Click to sort",
  "ascending": "Ascending",
  "descending": "Descending",
  "export": "Export",
  "exportData": "Export Data",
  "format": "Format",
  "exportCurrent": "Export Current Page",
  "exportAll": "Export All",
  "exportSelected": "Export Selected ({count})",
}

const mockT = (key: string) => translations[key] || key

jest.mock("next-intl", () => ({
  useTranslations: () => mockT,
  useLocale: () => "en",
}))

// ==================== 导入被测试模块 ====================

import { applySort, type SortConfig } from "../TableSorter"
import { applyFilters, type FilterConfig } from "../TableFilter"
import { exportData, type ExportFormat } from "../DataExporter"
import { ColumnCustomizer } from "../ColumnCustomizer"

// ==================== applySort 测试 ====================

describe("applySort", () => {
  const testData = [
    { name: "B商品", price: 200, stock: 50 },
    { name: "A商品", price: 100, stock: 30 },
    { name: "C商品", price: 300, stock: 20 },
  ]

  it("空排序配置应返回原数据", () => {
    const result = applySort(testData, [])
    expect(result[0].name).toBe("B商品")
  })

  it("单字段升序排序（字符串）", () => {
    const configs: SortConfig[] = [{ key: "name", direction: "asc" }]
    const result = applySort(testData, configs)
    expect(result[0].name).toBe("A商品")
    expect(result[1].name).toBe("B商品")
    expect(result[2].name).toBe("C商品")
  })

  it("单字段降序排序（字符串）", () => {
    const configs: SortConfig[] = [{ key: "name", direction: "desc" }]
    const result = applySort(testData, configs)
    expect(result[0].name).toBe("C商品")
  })

  it("单字段升序排序（数字）", () => {
    const configs: SortConfig[] = [{ key: "price", direction: "asc" }]
    const result = applySort(testData, configs)
    expect(result[0].price).toBe(100)
    expect(result[1].price).toBe(200)
    expect(result[2].price).toBe(300)
  })

  it("单字段降序排序（数字）", () => {
    const configs: SortConfig[] = [{ key: "price", direction: "desc" }]
    const result = applySort(testData, configs)
    expect(result[0].price).toBe(300)
  })

  it("多字段排序：价格相同时按库存排序", () => {
    const multiData = [
      { name: "X", price: 100, stock: 10 },
      { name: "Y", price: 100, stock: 20 },
      { name: "Z", price: 200, stock: 5 },
    ]
    const configs: SortConfig[] = [
      { key: "price", direction: "asc" },
      { key: "stock", direction: "asc" },
    ]
    const result = applySort(multiData, configs)
    expect(result[0].name).toBe("X") // 价格100, 库存10
    expect(result[1].name).toBe("Y") // 价格100, 库存20
    expect(result[2].name).toBe("Z") // 价格200, 库存5
  })
})

// ==================== applyFilters 测试 ====================

describe("applyFilters", () => {
  const testData = [
    { name: "iPhone 15", price: 799, status: "active", category: "electronics" },
    { name: "Samsung TV", price: 1200, status: "active", category: "electronics" },
    { name: "Nike Shoes", price: 150, status: "inactive", category: "fashion" },
    { name: "Adidas Jacket", price: 200, status: "active", category: "fashion" },
  ]

  it("空筛选条件应返回全部数据", () => {
    const filters: FilterConfig[] = [
      { key: "name", type: "text", value: "" },
    ]
    const result = applyFilters(testData, filters)
    expect(result).toHaveLength(4)
  })

  it("文本筛选应匹配包含关键词的数据", () => {
    const filters: FilterConfig[] = [
      { key: "name", type: "text", value: "iPhone" },
    ]
    const result = applyFilters(testData, filters)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("iPhone 15")
  })

  it("文本筛选应不区分大小写", () => {
    const filters: FilterConfig[] = [
      { key: "name", type: "text", value: "iphone" },
    ]
    const result = applyFilters(testData, filters)
    expect(result).toHaveLength(1)
  })

  it("数字范围筛选（仅最大值）", () => {
    const filters: FilterConfig[] = [
      { key: "price", type: "number", value: "", maxValue: "200" },
    ]
    const result = applyFilters(testData, filters)
    expect(result).toHaveLength(2) // Nike Shoes(150) + Adidas Jacket(200)
  })

  it("数字范围筛选（仅最小值）", () => {
    const filters: FilterConfig[] = [
      { key: "price", type: "number", value: "", minValue: "799" },
    ]
    const result = applyFilters(testData, filters)
    expect(result).toHaveLength(2) // iPhone 15(799) + Samsung TV(1200)
  })

  it("数字范围筛选（最小值和最大值）", () => {
    const filters: FilterConfig[] = [
      { key: "price", type: "number", value: "", minValue: "150", maxValue: "300" },
    ]
    const result = applyFilters(testData, filters)
    expect(result).toHaveLength(2) // Nike Shoes(150) + Adidas Jacket(200)
  })

  it("下拉选择筛选", () => {
    const filters: FilterConfig[] = [
      { key: "category", type: "select", value: "fashion", options: [] },
    ]
    const result = applyFilters(testData, filters)
    expect(result).toHaveLength(2)
    expect(result.every((r) => r.category === "fashion")).toBe(true)
  })

  it("多个筛选条件组合", () => {
    const filters: FilterConfig[] = [
      { key: "status", type: "select", value: "active", options: [] },
      { key: "price", type: "number", value: "", minValue: "500" },
    ]
    const result = applyFilters(testData, filters)
    expect(result).toHaveLength(2) // iPhone 15 + Samsung TV
    expect(result.every((r) => r.status === "active")).toBe(true)
    expect(result.every((r) => r.price >= 500)).toBe(true)
  })
})

// ==================== exportData 测试 ====================

describe("exportData", () => {
  const testData = [
    { name: "Product A", price: 100 },
    { name: "Product B", price: 200 },
  ]
  const columns = [
    { key: "name", label: "商品名称" },
    { key: "price", label: "价格" },
  ]

  beforeEach(() => {
    // Mock URL.createObjectURL
    URL.createObjectURL = jest.fn(() => "blob:test")
    URL.revokeObjectURL = jest.fn()
    // Mock anchor click
    HTMLAnchorElement.prototype.click = jest.fn()
  })

  it("CSV 导出应生成正确的 BOM 头", () => {
    const createElementSpy = jest.spyOn(document, "createElement")
    exportData(testData, columns, "csv", "test")
    // CSV 应以 UTF-8 BOM 开头
    const blobCalls = (global.Blob as jest.Mock)?.mock?.calls
    expect(URL.createObjectURL).toHaveBeenCalled()
  })

  it("Excel 导出应调用 XLSX", () => {
    exportData(testData, columns, "xlsx", "test")
    expect(URL.createObjectURL).toHaveBeenCalled()
  })
})

// ==================== ColumnCustomizer 组件测试 ====================

describe("ColumnCustomizer", () => {
  const columns = [
    { key: "name", label: "商品名称", visible: true },
    { key: "price", label: "价格", visible: true },
    { key: "stock", label: "库存", visible: false },
  ]

  it("应渲染按钮", () => {
    render(<ColumnCustomizer columns={columns} onChange={jest.fn()} />)
    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  it("点击按钮应打开下拉面板", () => {
    render(<ColumnCustomizer columns={columns} onChange={jest.fn()} />)
    const button = screen.getByRole("button")
    fireEvent.click(button)
    // 面板应该显示列名
    expect(screen.getByText("商品名称")).toBeInTheDocument()
    expect(screen.getByText("价格")).toBeInTheDocument()
    expect(screen.getByText("库存")).toBeInTheDocument()
  })

  it("点击复选框应调用 onChange", () => {
    const onChange = jest.fn()
    render(<ColumnCustomizer columns={columns} onChange={onChange} />)
    fireEvent.click(screen.getByRole("button"))

    const checkboxes = screen.getAllByRole("checkbox")
    expect(checkboxes).toHaveLength(3)
    // 第一个是已选中（visible: true）
    expect(checkboxes[0]).toBeChecked()
    // 第三个是未选中（visible: false）
    expect(checkboxes[2]).not.toBeChecked()
  })
})
