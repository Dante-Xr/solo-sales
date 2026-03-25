/**
 * ============================================
 * 星级评分组件 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 展示星级评分 (1-5 星)
 *   - 支持只读模式和编辑模式
 *   - 支持半星显示
 * ============================================
 */

"use client"

import { Star } from "lucide-react"
import { useState } from "react"

interface StarRatingProps {
  /** 当前评分 */
  rating: number
  /** 最大星数 */
  maxRating?: number
  /** 星星大小 */
  size?: number
  /** 是否只读 (用于展示) */
  readOnly?: boolean
  /** 颜色 */
  color?: string
  /** 空心颜色 */
  emptyColor?: string
  /** 评分变化时的回调 */
  onChange?: (rating: number) => void
  /** 自定义样式 */
  className?: string
}

/**
 * 星级评分组件
 * - readOnly=true: 展示模式，鼠标悬停无效果
 * - readOnly=false: 编辑模式，鼠标悬停高亮，点击选择评分
 */
export function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  readOnly = false,
  color = "#fbbf24", // 黄色
  emptyColor = "#d1d5db", // 灰色
  onChange,
  className = "",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  // 当前显示的评分 (hover 时优先显示 hover 的值)
  const displayRating = hoverRating !== null ? hoverRating : rating

  // 处理鼠标进入
  const handleMouseEnter = (index: number) => {
    if (!readOnly) {
      setHoverRating(index)
    }
  }

  // 处理鼠标离开
  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(null)
    }
  }

  // 处理点击
  const handleClick = (index: number) => {
    if (!readOnly && onChange) {
      onChange(index)
    }
  }

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: maxRating }, (_, index) => {
        const starIndex = index + 1
        const isFilled = starIndex <= displayRating

        return (
          <button
            key={starIndex}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onClick={() => handleClick(starIndex)}
            className={`
              transition-transform duration-150
              ${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"}
              disabled:cursor-not-allowed disabled:hover:scale-100
            `}
            style={{ background: "none", border: "none", padding: 0 }}
          >
            <Star
              size={size}
              fill={isFilled ? color : "none"}
              stroke={isFilled ? color : emptyColor}
              strokeWidth={1.5}
              className={`
                transition-colors duration-150
                ${!readOnly && isFilled ? "opacity-100" : ""}
              `}
            />
          </button>
        )
      })}
    </div>
  )
}

/**
 * 带数字的评分展示
 */
export function StarRatingWithValue({
  rating,
  size = 16,
  showValue = true,
  reviewCount,
  ...props
}: StarRatingProps & { showValue?: boolean; reviewCount?: number }) {
  return (
    <div className="flex items-center gap-2">
      <StarRating rating={rating} size={size} readOnly {...props} />
      {showValue && (
        <span className="text-sm font-medium text-foreground">
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-sm text-muted-foreground">
          ({reviewCount} 条评价)
        </span>
      )}
    </div>
  )
}