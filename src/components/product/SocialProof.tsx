/**
 * ============================================
 * 社交证明组件 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 显示已售数量
 *   - 显示当前浏览人数
 *   - 增强用户购买信心 (FOMO 效应)
 * ============================================
 */

"use client"

import { useEffect, useState } from "react"
import { Users, ShoppingCart, Flame } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface SocialProofProps {
  /** 已售数量 */
  soldCount?: number
  /** 当前浏览人数 */
  viewingCount?: number
  /** 今日销量 */
  todaySales?: number
  /** 显示模式 */
  variant?: "inline" | "card" | "badge"
  /** 动画效果 */
  animate?: boolean
  /** 自定义样式 */
  className?: string
}

/**
 * 格式化数字 (如 1000 -> 1K)
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

/**
 * 社交证明组件
 */
export function SocialProof({
  soldCount = 0,
  viewingCount,
  todaySales,
  variant = "inline",
  animate = true,
  className = "",
}: SocialProofProps) {
  const [displayViewing, setDisplayViewing] = useState(viewingCount || 0)

  // 模拟实时浏览人数波动
  useEffect(() => {
    if (viewingCount === undefined || !animate) return

    const interval = setInterval(() => {
      // 在原基础上 ±20% 波动
      const variation = Math.floor(viewingCount * 0.2)
      const newCount = viewingCount + Math.floor(Math.random() * variation * 2 - variation)
      setDisplayViewing(Math.max(1, newCount))
    }, 5000)

    return () => clearInterval(interval)
  }, [viewingCount, animate])

  //  Badge 模式
  if (variant === "badge") {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {soldCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <ShoppingCart size={12} />
            已售 {formatNumber(soldCount)}
          </span>
        )}
        {displayViewing > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
            <Users size={12} />
            {displayViewing} 人正在浏览
          </span>
        )}
      </div>
    )
  }

  // Card 模式
  if (variant === "card") {
    return (
      <Card className={className}>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-4">
            {soldCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <ShoppingCart size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">
                    {formatNumber(soldCount)}
                  </p>
                  <p className="text-xs text-muted-foreground">已售</p>
                </div>
              </div>
            )}

            {displayViewing > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Users size={16} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-orange-600">
                    {displayViewing}
                  </p>
                  <p className="text-xs text-muted-foreground">正在浏览</p>
                </div>
              </div>
            )}

            {todaySales !== undefined && todaySales > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <Flame size={16} className="text-price" />
                </div>
                <div>
                  <p className="text-lg font-bold text-price">
                    {formatNumber(todaySales)}
                  </p>
                  <p className="text-xs text-muted-foreground">今日销量</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Inline 模式 (默认)
  return (
    <div className={`flex flex-wrap items-center gap-4 text-sm ${className}`}>
      {soldCount > 0 && (
        <div className="flex items-center gap-1.5 text-green-600">
          <ShoppingCart size={16} />
          <span>
            <strong>{formatNumber(soldCount)}</strong> 件已售
          </span>
        </div>
      )}

      {displayViewing > 0 && (
        <div className="flex items-center gap-1.5 text-orange-600">
          <Users size={16} />
          <span>
            <strong>{displayViewing}</strong> 人正在浏览此商品
          </span>
        </div>
      )}

      {todaySales !== undefined && todaySales > 0 && (
        <div className="flex items-center gap-1.5 text-price">
          <Flame size={16} />
          <span>
            今日 <strong>{formatNumber(todaySales)}</strong> 件
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * 热销排行组件
 */
export function HotSellingBadge({
  rank,
  className = "",
}: {
  rank: number
  className?: string
}) {
  if (rank > 10) return null

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium ${className}`}
    >
      <Flame size={12} />
      热销第 {rank} 名
    </span>
  )
}