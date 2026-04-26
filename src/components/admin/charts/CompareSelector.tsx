/**
 * ============================================
 * 对比选择器组件 (Phase 2 图表增强)
 * ============================================
 * 功能说明：
 *   - 支持环比对比（与上一周期对比）
 *   - 支持同比对比（与去年同期对比）
 *   - 增长率计算显示
 *   - 对比数据 tooltip 提示
 * ============================================
 */

"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import type { CompareMode } from "./chart-types"

interface CompareSelectorProps {
  value: CompareMode
  onChange: (mode: CompareMode) => void
}

export function CompareSelector({ value, onChange }: CompareSelectorProps) {
  const t = useTranslations("admin.charts.compare")

  const modes: CompareMode[] = ["none", "previous", "yearAgo"]

  const getModeLabel = (mode: CompareMode): string => {
    const labels: Record<CompareMode, string> = {
      none: t("none"),
      previous: t("previous"),
      yearAgo: t("yearAgo"),
    }
    return labels[mode]
  }

  return (
    <div className="flex gap-1">
      {modes.map((mode) => (
        <Button
          key={mode}
          variant={value === mode ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(mode)}
        >
          {getModeLabel(mode)}
        </Button>
      ))}
    </div>
  )
}
