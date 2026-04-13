/**
 * ============================================
 * KPI 卡片组件 (Phase 5 管理后台重构)
 * ============================================
 * 创建日期: 2026-04-13
 * 创建时间: 22:20
 * 功能说明：
 *   - 使用 Tremor Card + shadcn/ui 构建 KPI 指标卡片
 *   - 支持趋势显示（上升/下降）
 *   - 支持暗色模式
 *   - 响应式设计
 * ============================================
 */

"use client"

import { Card } from "@tremor/react"
import { type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type DeltaType = "increase" | "decrease" | "unchanged"

interface KpiCardProps {
  title: string
  value: string | number
  delta?: string
  deltaType?: DeltaType
  icon?: LucideIcon
}

export function KpiCard({ title, value, delta, deltaType, icon: IconComponent }: KpiCardProps) {
  const deltaColor =
    deltaType === "increase"
      ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950"
      : deltaType === "decrease"
        ? "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950"
        : "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950"

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {delta && (
            <Badge variant="outline" className={`mt-2 text-xs ${deltaColor}`}>
              {deltaType === "increase" ? "↑" : deltaType === "decrease" ? "↓" : "→"} {delta}
            </Badge>
          )}
        </div>
        {IconComponent && (
          <div className="rounded-lg bg-primary/10 p-2">
            <IconComponent className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
    </Card>
  )
}

interface KpiGridProps {
  cards: KpiCardProps[]
}

export function KpiGrid({ cards }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, index) => (
        <KpiCard key={index} {...card} />
      ))}
    </div>
  )
}