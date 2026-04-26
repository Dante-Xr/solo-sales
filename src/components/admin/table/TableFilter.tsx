/**
 * ============================================
 * 表格筛选组件 (v1.2 Phase 3)
 * ============================================
 * 功能说明：
 *   - 表头下拉筛选
 *   - 支持文本搜索、数字范围、下拉选择
 *   - 可同时应用多个筛选条件
 *   - 支持清除所有筛选
 * ============================================
 */

"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Filter } from "lucide-react"
import { cn } from "@/lib/utils"

// ==================== 类型定义 ====================

export type FilterType = "text" | "number" | "select"

export interface FilterConfig {
  key: string
  type: FilterType
  value: string
  /** 下拉选择的选项 */
  options?: { label: string; value: string }[]
  /** 数字范围时的最小值 */
  minValue?: string
  /** 数字范围时的最大值 */
  maxValue?: string
}

interface TableFilterProps {
  filters: FilterConfig[]
  onChange: (filters: FilterConfig[]) => void
  /** 活跃的筛选数量 */
  activeCount?: number
}

// ==================== 组件实现 ====================

export function TableFilter({ filters, onChange, activeCount }: TableFilterProps) {
  const t = useTranslations("admin.table")
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const [localFilters, setLocalFilters] = useState<FilterConfig[]>(filters)

  /** 外部 filters prop 变化时同步 localFilters */
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  /** 点击外部关闭 */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        // 放弃未应用的修改
        setLocalFilters(filters)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, filters])

  /** 更新单个筛选条件的值 */
  const updateFilter = (key: string, field: "value" | "minValue" | "maxValue", val: string) => {
    setLocalFilters((prev) =>
      prev.map((f) => (f.key === key ? { ...f, [field]: val } : f))
    )
  }

  /** 应用筛选条件 */
  const applyFilters = () => {
    onChange(localFilters)
    setIsOpen(false)
  }

  /** 清除所有筛选 */
  const clearAll = () => {
    const cleared = filters.map((f) => ({
      ...f,
      value: "",
      minValue: "",
      maxValue: "",
    }))
    setLocalFilters(cleared)
    onChange(cleared)
  }

  /** 是否有活跃的筛选 */
  const hasActiveFilters =
    (activeCount ? true : false) ||
    localFilters.some(
      (f) => f.value || f.minValue || f.maxValue
    )

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 rounded-md border border-border hover:bg-muted transition-colors flex items-center gap-1.5 text-sm relative",
          isOpen && "bg-muted"
        )}
        title={t("filter")}
      >
        <Filter className={cn("h-4 w-4", hasActiveFilters && "text-primary")} />
        <span className="hidden sm:inline">{t("filter")}</span>
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-medium">
            {activeCount || localFilters.filter((f) => f.value || f.minValue || f.maxValue).length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-card rounded-lg shadow-lg border border-border z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
            <span className="text-xs font-medium">{t("filter")}</span>
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("clearFilters")}
            </button>
          </div>

          <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
            {localFilters.map((filter) => (
              <div key={filter.key} className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {filter.key}
                </label>

                {/* 文本筛选 */}
                {filter.type === "text" && (
                  <input
                    type="text"
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.key, "value", e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="w-full h-9 px-3 text-sm border border-border rounded-md bg-background outline-none focus:border-primary transition-colors"
                  />
                )}

                {/* 数字范围筛选 */}
                {filter.type === "number" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filter.minValue || ""}
                      onChange={(e) => updateFilter(filter.key, "minValue", e.target.value)}
                      placeholder={t("min")}
                      className="w-1/2 h-9 px-2 text-sm border border-border rounded-md bg-background outline-none focus:border-primary transition-colors"
                    />
                    <span className="text-muted-foreground text-xs">-</span>
                    <input
                      type="number"
                      value={filter.maxValue || ""}
                      onChange={(e) => updateFilter(filter.key, "maxValue", e.target.value)}
                      placeholder={t("max")}
                      className="w-1/2 h-9 px-2 text-sm border border-border rounded-md bg-background outline-none focus:border-primary transition-colors"
                    />
                  </div>
                )}

                {/* 下拉选择筛选 */}
                {filter.type === "select" && filter.options && (
                  <select
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.key, "value", e.target.value)}
                    className="w-full h-9 px-2 text-sm border border-border rounded-md bg-background outline-none focus:border-primary transition-colors"
                  >
                    <option value="">{t("all")}</option>
                    {filter.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 px-3 py-2 border-t border-border bg-muted/50">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              onClick={applyFilters}
              className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("apply")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** 对数据应用筛选条件 */
export function applyFilters<T extends Record<string, unknown>>(
  data: T[],
  filters: FilterConfig[]
): T[] {
  const activeFilters = filters.filter(
    (f) => f.value || f.minValue || f.maxValue
  )

  if (activeFilters.length === 0) return data

  return data.filter((item) =>
    activeFilters.every((filter) => {
      const itemValue = item[filter.key]

      if (filter.type === "text") {
        const strVal = String(itemValue || "").toLowerCase()
        return strVal.includes(filter.value.toLowerCase())
      }

      if (filter.type === "number") {
        const numVal = Number(itemValue)
        if (isNaN(numVal)) return false
        if (filter.minValue && numVal < Number(filter.minValue)) return false
        if (filter.maxValue && numVal > Number(filter.maxValue)) return false
        return true
      }

      if (filter.type === "select") {
        return String(itemValue) === filter.value
      }

      return true
    })
  )
}
