/**
 * ============================================
 * 库存紧迫感组件 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 显示低库存警告
 *   - 显示补货日期
 *   - 创建购买紧迫感，提升转化率
 * ============================================
 */

"use client"

import { AlertTriangle, Clock, Package } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface UrgencyWidgetProps {
  /** 当前库存数量 */
  stockCount: number
  /** 低库存阈值 (默认: 10) */
  lowStockThreshold?: number
  /** 非常低库存阈值 (默认: 3) */
  criticalStockThreshold?: number
  /** 日均销量 (可选) */
  salesCount?: number
  /** 补货日期 (可选) */
  restockDate?: Date | string
  /** 是否显示动画 */
  animate?: boolean
  /** 自定义样式 */
  className?: string
}

/**
 * 库存紧迫感组件
 *
 * 显示逻辑:
 * - stockCount <= criticalStockThreshold: "库存紧张，最后 X 件"
 * - stockCount <= lowStockThreshold: "仅剩 X 件"
 * - stockCount > lowStockThreshold: 不显示
 * - 有 restockDate: 显示预计补货日期
 */
export function UrgencyWidget({
  stockCount,
  lowStockThreshold = 10,
  criticalStockThreshold = 3,
  salesCount,
  restockDate,
  animate = true,
  className = "",
}: UrgencyWidgetProps) {
  // 不显示的情况
  if (stockCount > lowStockThreshold) {
    return null
  }

  // 计算剩余库存百分比
  const stockPercentage = Math.min((stockCount / lowStockThreshold) * 100, 100)

  // 判断紧迫程度
  const isCritical = stockCount <= criticalStockThreshold
  const _isLow = stockCount <= lowStockThreshold

  // 计算预计售完天数
  const daysUntilSoldOut =
    salesCount && salesCount > 0 ? Math.ceil(stockCount / salesCount) : null

  // 格式化补货日期
  const formatRestockDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date
    const now = new Date()
    const diffTime = d.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) {
      return "即将补货"
    } else if (diffDays === 1) {
      return "明天"
    } else if (diffDays <= 7) {
      return `${diffDays} 天后`
    } else {
      return d.toLocaleDateString("zh-CN", { month: "long", day: "numeric" })
    }
  }

  return (
    <Card
      className={`
        ${isCritical ? "border-destructive/50 bg-destructive/5" : "border-orange-200 bg-orange-50"}
        ${animate ? "animate-pulse-subtle" : ""}
        ${className}
      `}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* 主要警告 */}
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={18}
              className={isCritical ? "text-destructive" : "text-warning"}
            />
            <span
              className={`font-semibold text-sm ${
                isCritical ? "text-destructive" : "text-warning"
              }`}
            >
              {isCritical
                ? `库存紧张，仅剩 ${stockCount} 件！`
                : `仅剩 ${stockCount} 件`}
            </span>
          </div>

          {/* 库存条 */}
          <div className="relative h-2 bg-orange-100 rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                isCritical ? "bg-destructive" : "bg-orange-400"
              }`}
              style={{ width: `${stockPercentage}%` }}
            />
          </div>

          {/* 辅助信息 */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {/* 预计售完 */}
            {daysUntilSoldOut !== null && (
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>
                  {daysUntilSoldOut <= 1
                    ? "即将售完"
                    : `约 ${daysUntilSoldOut} 天后售完`}
                </span>
              </div>
            )}

            {/* 补货日期 */}
            {restockDate && (
              <div className="flex items-center gap-1">
                <Package size={12} />
                <span>预计 {formatRestockDate(restockDate)} 补货</span>
              </div>
            )}
          </div>

          {/* 高销量提示 */}
          {salesCount && salesCount > 10 && (
            <p className="text-xs text-warning mt-1">
              🔥 近 ${salesCount} 人正在浏览此商品
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * 迷你版紧迫感组件 (用于商品卡片)
 */
export function UrgencyBadge({
  stockCount,
  lowStockThreshold = 10,
}: {
  stockCount: number
  lowStockThreshold?: number
}) {
  if (stockCount > lowStockThreshold) {
    return null
  }

  const isCritical = stockCount <= 3

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
        ${
          isCritical
            ? "bg-destructive text-destructive-foreground"
            : "bg-warning/10 text-warning"
        }
      `}
    >
      {isCritical ? "库存紧张" : `仅剩 ${stockCount} 件`}
    </span>
  )
}