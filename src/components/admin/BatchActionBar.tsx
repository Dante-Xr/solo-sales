/**
 * ============================================
 * 批量操作栏组件
 * ============================================
 * 修改时间：2026-06-27 04:10:00 +08:00
 * 修改内容：将硬编码颜色映射到主题变量
 * 修改依据：UI设计师专家建议 - P0优先级
 * ============================================
 */
"use client"

import { ToggleRight, ToggleLeft, Trash2, X, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BatchActionBarProps {
  selectedCount: number
  onPublish: () => void
  onUnpublish: () => void
  onDelete: () => void
  onDiscount?: () => void
  onClear: () => void
  isZh: boolean
}

export function BatchActionBar({
  selectedCount,
  onPublish,
  onUnpublish,
  onDelete,
  onDiscount,
  onClear,
  isZh,
}: BatchActionBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-background border rounded-full px-6 py-3 shadow-lg">
      <span className="text-sm font-medium">
        {isZh ? "已选择" : "Selected"} {selectedCount} {isZh ? "项" : "items"}
      </span>

      <div className="w-px h-6 bg-border" />

      <Button variant="outline" size="sm" onClick={onPublish} className="gap-1">
        <ToggleRight className="w-4 h-4 text-success" />
        {isZh ? "上架" : "Publish"}
      </Button>

      <Button variant="outline" size="sm" onClick={onUnpublish} className="gap-1">
        <ToggleLeft className="w-4 h-4" />
        {isZh ? "下架" : "Unpublish"}
      </Button>

      <Button variant="outline" size="sm" onClick={onDelete} className="gap-1 text-destructive hover:text-destructive">
        <Trash2 className="w-4 h-4" />
        {isZh ? "删除" : "Delete"}
      </Button>

      {onDiscount && (
        <Button variant="outline" size="sm" onClick={onDiscount} className="gap-1">
          <Percent className="w-4 h-4" />
          {isZh ? "折扣" : "Discount"}
        </Button>
      )}

      <div className="w-px h-6 bg-border" />

      <Button variant="ghost" size="sm" onClick={onClear} className="gap-1">
        <X className="w-4 h-4" />
        {isZh ? "取消" : "Clear"}
      </Button>
    </div>
  )
}