/**
 * ============================================
 * 评论汇总组件 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 展示评分统计信息
 *   - 展示评分分布柱状图
 * ============================================
 */

"use client"

import { StarRating } from "./StarRating"
import { Progress } from "@/components/ui/progress"

interface ReviewSummaryProps {
  /** 平均评分 */
  averageRating: number
  /** 总评论数 */
  totalReviews: number
  /** 评分分布 {1: count, 2: count, ...} */
  ratingDistribution: Record<number, number>
}

/**
 * 评论汇总组件
 */
export function ReviewSummary({
  averageRating,
  totalReviews,
  ratingDistribution,
}: ReviewSummaryProps) {
  // 计算每个评分的百分比
  const getPercentage = (rating: number) => {
    if (totalReviews === 0) return 0
    return ((ratingDistribution[rating] || 0) / totalReviews) * 100
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 bg-muted/30 rounded-lg">
      {/* 平均评分 */}
      <div className="flex flex-col items-center justify-center min-w-[120px]">
        <div className="text-4xl font-bold text-foreground">
          {averageRating.toFixed(1)}
        </div>
        <StarRating rating={averageRating} size={18} readOnly />
        <div className="text-sm text-muted-foreground mt-1">
          {totalReviews} 条评价
        </div>
      </div>

      {/* 评分分布 */}
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center gap-2">
            <span className="text-sm w-6 text-muted-foreground text-center">
              {rating}
            </span>
            <Progress
              value={getPercentage(rating)}
              className="h-2 flex-1"
            />
            <span className="text-sm w-10 text-right text-muted-foreground">
              {ratingDistribution[rating] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}