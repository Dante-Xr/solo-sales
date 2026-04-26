/**
 * ============================================
 * 日期范围选择器组件 (Phase 2 图表增强)
 * ============================================
 * 功能说明：
 *   - 支持预设快捷日期范围选择
 *   - 支持自定义日期范围输入
 *   - 日期格式本地化（中/英文）
 *   - 与图表数据联动
 * ============================================
 */

"use client"

import { useState, useCallback } from "react"
import { format, subDays, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns"
import { useTranslations, useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { DateRange, PresetRange } from "./chart-types"

interface DateRangePickerProps {
  value: DateRange
  presetRange: PresetRange
  onChange: (range: DateRange, preset: PresetRange) => void
}

interface PresetOption {
  key: PresetRange
  getRange: () => DateRange
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    key: "today",
    getRange: () => ({ startDate: startOfDay(new Date()), endDate: endOfDay(new Date()) }),
  },
  {
    key: "yesterday",
    getRange: () => ({ startDate: startOfDay(subDays(new Date(), 1)), endDate: endOfDay(subDays(new Date(), 1)) }),
  },
  {
    key: "last7days",
    getRange: () => ({ startDate: startOfDay(subDays(new Date(), 6)), endDate: endOfDay(new Date()) }),
  },
  {
    key: "last30days",
    getRange: () => ({ startDate: startOfDay(subDays(new Date(), 29)), endDate: endOfDay(new Date()) }),
  },
  {
    key: "thisMonth",
    getRange: () => ({ startDate: startOfMonth(new Date()), endDate: endOfDay(new Date()) }),
  },
  {
    key: "lastMonth",
    getRange: () => {
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      return { startDate: startOfMonth(lastMonth), endDate: endOfMonth(lastMonth) }
    },
  },
]

export function DateRangePicker({ value, presetRange, onChange }: DateRangePickerProps) {
  const t = useTranslations("admin.charts.dateRange")
  const locale = useLocale()
  const [customStart, setCustomStart] = useState(format(value.startDate, "yyyy-MM-dd"))
  const [customEnd, setCustomEnd] = useState(format(value.endDate, "yyyy-MM-dd"))
  const [showCustom, setShowCustom] = useState(presetRange === "custom")

  const dateLocale = locale === "zh" ? "zh-CN" : "en-US"

  const handlePresetClick = useCallback((option: PresetOption) => {
    const range = option.getRange()
    onChange(range, option.key)
    setShowCustom(false)
    setCustomStart(format(range.startDate, "yyyy-MM-dd"))
    setCustomEnd(format(range.endDate, "yyyy-MM-dd"))
  }, [onChange])

  const handleCustomApply = useCallback(() => {
    const start = new Date(customStart)
    const end = new Date(customEnd)
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
      onChange({ startDate: startOfDay(start), endDate: endOfDay(end) }, "custom")
    }
  }, [customStart, customEnd, onChange])

  const formatDateDisplay = (date: Date) => {
    return format(date, locale === "zh" ? "yyyy年M月d日" : "MMM d, yyyy")
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESET_OPTIONS.map((option) => (
          <Button
            key={option.key}
            variant={presetRange === option.key ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetClick(option)}
          >
            {t(option.key)}
          </Button>
        ))}
        <Button
          variant={presetRange === "custom" ? "default" : "outline"}
          size="sm"
          onClick={() => setShowCustom(!showCustom)}
        >
          {t("custom")}
        </Button>
      </div>

      {showCustom && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="w-auto"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="w-auto"
          />
          <Button size="sm" onClick={handleCustomApply}>
            {t("apply")}
          </Button>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        {formatDateDisplay(value.startDate)} ~ {formatDateDisplay(value.endDate)}
      </div>
    </div>
  )
}
