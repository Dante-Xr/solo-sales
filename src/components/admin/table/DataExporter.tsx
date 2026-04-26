/**
 * ============================================
 * 数据导出组件 (v1.2 Phase 3)
 * ============================================
 * 功能说明：
 *   - 支持导出 CSV 和 Excel (xlsx) 格式
 *   - 导出当前页/全部/选中行
 *   - 使用 xlsx 库生成 Excel 文件
 * ============================================
 */

"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Download, FileSpreadsheet, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import * as XLSX from "xlsx"

export type ExportFormat = "csv" | "xlsx"
export type ExportScope = "current" | "all" | "selected"

interface DataExporterProps {
  /** 导出的列配置 */
  columns: { key: string; label: string }[]
  /** 当前页数据 */
  currentData: Record<string, unknown>[]
  /** 全部数据（可选，如果没有则降级为导出当前页） */
  allData?: Record<string, unknown>[]
  /** 已选中的行数 */
  selectedCount?: number
  /** 获取选中行的数据 */
  getSelectedData?: () => Record<string, unknown>[]
  /** 导出文件名前缀 */
  filename?: string
}

export function DataExporter({
  columns,
  currentData,
  allData,
  selectedCount = 0,
  getSelectedData,
  filename = "export",
}: DataExporterProps) {
  const t = useTranslations("admin.table")
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  /** 执行导出 */
  const doExport = (format: ExportFormat, scope: ExportScope) => {
    let data: Record<string, unknown>[]

    switch (scope) {
      case "current":
        data = currentData
        break
      case "all":
        data = allData || currentData
        break
      case "selected":
        data = getSelectedData ? getSelectedData() : []
        break
      default:
        data = currentData
    }

    if (!data || data.length === 0) return

    exportData(data, columns, format, `${filename}_${new Date().toISOString().slice(0, 10)}`)
    setIsOpen(false)
  }

  const hasSelected = selectedCount > 0 && getSelectedData

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 rounded-md border border-border hover:bg-muted transition-colors flex items-center gap-1.5 text-sm",
          isOpen && "bg-muted"
        )}
        title={t("export")}
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">{t("export")}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-card rounded-lg shadow-lg border border-border z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/50">
            <span className="text-xs font-medium">{t("exportData")}</span>
          </div>

          <div className="p-2 space-y-1">
            {/* CSV 格式 */}
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
              {t("format")}: CSV
            </div>
            <button
              onClick={() => doExport("csv", "current")}
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted rounded-md transition-colors flex items-center gap-2"
            >
              <FileText className="h-3.5 w-3.5" />
              {t("exportCurrent")}
            </button>
            {allData && (
              <button
                onClick={() => doExport("csv", "all")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted rounded-md transition-colors flex items-center gap-2"
              >
                <FileText className="h-3.5 w-3.5" />
                {t("exportAll")}
              </button>
            )}

            {/* Excel 格式 */}
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
              {t("format")}: Excel
            </div>
            <button
              onClick={() => doExport("xlsx", "current")}
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted rounded-md transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              {t("exportCurrent")}
            </button>
            {allData && (
              <button
                onClick={() => doExport("xlsx", "all")}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted rounded-md transition-colors flex items-center gap-2"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                {t("exportAll")}
              </button>
            )}

            {/* 导出选中行 */}
            {hasSelected && (
              <>
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => doExport("xlsx", "selected")}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted rounded-md transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  {t("exportSelected", { count: selectedCount })}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/** 导出数据到文件 */
export function exportData(
  data: Record<string, unknown>[],
  columns: { key: string; label: string }[],
  format: ExportFormat,
  filename: string
) {
  // 构建导出数据（只包含可见列并使用显示标签作为表头）
  const exportRows = data.map((row) => {
    const exportRow: Record<string, unknown> = {}
    columns.forEach((col) => {
      exportRow[col.label] = row[col.key]
    })
    return exportRow
  })

  if (format === "csv") {
    exportCSV(exportRows, filename)
  } else {
    exportExcel(exportRows, filename)
  }
}

/**
 * 对 CSV 字段值进行安全转义
 * 1. 双引号转义为两个双引号（RFC 4180 标准）
 * 2. 检测公式注入字符（=、+、-、@），在前面添加单引号前缀
 */
function safeCSVValue(value: unknown): string {
  const str = String(value ?? "")
  // 防御 CSV Injection：以 =、+、-、@ 开头的值添加单引号前缀
  if (/^[=+\-@]/.test(str)) {
    return `"'${str}"`
  }
  // 双引号转义：" → ""
  return `"${str.replace(/"/g, '""')}"`
}

/** 导出 CSV 格式 */
function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.map((h) => safeCSVValue(h)).join(","),
    ...data.map((row) =>
      headers.map((h) => safeCSVValue(row[h])).join(",")
    ),
  ]

  // BOM 头确保 Excel 正确识别 UTF-8
  const csvContent = "\uFEFF" + csvRows.join("\n")
  downloadBlob(csvContent, `${filename}.csv`, "text/csv;charset=utf-8")
}

/** 导出 Excel (xlsx) 格式 */
function exportExcel(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.xlsx`
  link.click()
  URL.revokeObjectURL(url)
}

/** 通用 Blob 下载 */
function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
