/**
 * 修改时间：2026-05-02 21:19:13 +08:00
 * 修改内容：清理表格排序组件未使用的 cn 导入，推进 M5 lint warnings 收敛。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 表格排序组件 (v1.2 Phase 3)
 * ============================================
 * 功能说明：
 *   - 点击表头排序（升序/降序/无）
 *   - 支持多字段排序（Shift+点击）
 *   - 显示排序方向指示器
 * ============================================
 */

"use client"

import { useTranslations } from "next-intl"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

export type SortDirection = "asc" | "desc"

export interface SortConfig {
  key: string
  direction: SortDirection
}

interface TableSorterProps {
  columns: { key: string; label: string; sortable?: boolean }[]
  sortConfigs: SortConfig[]
  onSort: (configs: SortConfig[]) => void
}

export function TableSorter({ columns, sortConfigs, onSort }: TableSorterProps) {
  const t = useTranslations("admin.table")

  /** 获取指定列的排序状态 */
  const getSortState = (key: string): SortDirection | null => {
    const config = sortConfigs.find((c) => c.key === key)
    return config?.direction || null
  }

  /** 处理表头点击 */
  const handleSort = (key: string, event: React.MouseEvent) => {
    const isMultiSort = event.shiftKey
    const currentState = getSortState(key)

    let newDirection: SortDirection | null
    if (!currentState) {
      newDirection = "asc"
    } else if (currentState === "asc") {
      newDirection = "desc"
    } else {
      newDirection = null
    }

    if (isMultiSort) {
      // 多字段排序
      const filtered = sortConfigs.filter((c) => c.key !== key)
      if (newDirection) {
        onSort([...filtered, { key, direction: newDirection }])
      } else {
        onSort(filtered)
      }
    } else {
      // 单字段排序
      if (newDirection) {
        onSort([{ key, direction: newDirection }])
      } else {
        onSort([])
      }
    }
  }

  return (
    <div className="flex items-center gap-1">
      {columns.map((col) => {
        if (col.sortable === false) return null

        const sortState = getSortState(col.key)
        const sortIndex = sortConfigs.findIndex((c) => c.key === col.key)

        return (
          <button
            key={col.key}
            onClick={(e) => handleSort(col.key, e)}
            className="flex items-center gap-0.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            title={
              !sortState
                ? t("clickToSort")
                : sortState === "asc"
                  ? t("ascending")
                  : t("descending")
            }
          >
            <span>{col.label}</span>
            {!sortState && <ArrowUpDown className="h-3 w-3" />}
            {sortState === "asc" && <ArrowUp className="h-3 w-3 text-primary" />}
            {sortState === "desc" && <ArrowDown className="h-3 w-3 text-primary" />}
            {/* 多字段排序编号 */}
            {sortConfigs.length > 1 && sortIndex >= 0 && (
              <span className="text-[10px] text-primary font-medium ml-0.5">
                {sortIndex + 1}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/** 对数据数组应用排序 */
export function applySort<T extends Record<string, unknown>>(
  data: T[],
  sortConfigs: SortConfig[]
): T[] {
  if (sortConfigs.length === 0) return data

  return [...data].sort((a, b) => {
    for (const config of sortConfigs) {
      const aVal = a[config.key]
      const bVal = b[config.key]

      let comparison = 0
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal
      } else if (typeof aVal === "string" && typeof bVal === "string") {
        comparison = aVal.localeCompare(bVal)
      }

      if (comparison !== 0) {
        return config.direction === "asc" ? comparison : -comparison
      }
    }
    return 0
  })
}
