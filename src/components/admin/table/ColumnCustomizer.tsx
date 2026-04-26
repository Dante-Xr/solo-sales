/**
 * ============================================
 * 列自定义组件 (v1.2 Phase 3)
 * ============================================
 * 功能说明：
 *   - 拖拽调整列显示/隐藏
 *   - 每列可单独切换可见性
 *   - 配置保存到 localStorage
 * ============================================
 */

"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Columns3, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ColumnConfig } from "@/stores/useAdminUIStore"

interface ColumnCustomizerProps {
  columns: ColumnConfig[]
  onChange: (columns: ColumnConfig[]) => void
}

export function ColumnCustomizer({ columns, onChange }: ColumnCustomizerProps) {
  const t = useTranslations("admin.table")
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  /** 点击外部关闭面板 */
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

  /** 切换列可见性 */
  const toggleColumn = (key: string) => {
    const updated = columns.map((col) =>
      col.key === key ? { ...col, visible: !col.visible } : col
    )
    onChange(updated)
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 rounded-md border border-border hover:bg-muted transition-colors flex items-center gap-1.5 text-sm",
          isOpen && "bg-muted"
        )}
        title={t("columnCustomize")}
      >
        <Columns3 className="h-4 w-4" />
        <span className="hidden sm:inline">{t("columns")}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-card rounded-lg shadow-lg border border-border z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/50">
            <span className="text-xs font-medium">{t("columnCustomize")}</span>
          </div>
          <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
            {columns.map((col) => (
              <label
                key={col.key}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={col.visible}
                  onChange={() => toggleColumn(col.key)}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm flex-1 truncate">{col.label}</span>
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab" />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
