"use client"

import { Star, StarHalf } from "lucide-react"
import { useState } from "react"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: number
  readOnly?: boolean
  color?: string
  emptyColor?: string
  onChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  readOnly = false,
  color = "#fbbf24",
  emptyColor = "#d1d5db",
  onChange,
  className = "",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const displayRating = hoverRating !== null ? hoverRating : rating

  const handleMouseEnter = (index: number) => {
    if (!readOnly) {
      setHoverRating(index)
    }
  }

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(null)
    }
  }

  const handleClick = (index: number) => {
    if (!readOnly && onChange) {
      onChange(index)
    }
  }

  const renderStar = (index: number) => {
    const starIndex = index + 1
    const diff = displayRating - starIndex + 1

    if (diff >= 1) {
      return (
        <Star
          size={size}
          fill={color}
          stroke={color}
          strokeWidth={1.5}
          className="transition-colors duration-150"
        />
      )
    }

    if (diff >= 0.5 && diff < 1) {
      return (
        <StarHalf
          size={size}
          fill={color}
          stroke={color}
          strokeWidth={1.5}
          className="transition-colors duration-150"
        />
      )
    }

    return (
      <Star
        size={size}
        fill="none"
        stroke={emptyColor}
        strokeWidth={1.5}
        className="transition-colors duration-150"
      />
    )
  }

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: maxRating }, (_, index) => (
        <button
          key={index}
          type="button"
          disabled={readOnly}
          onMouseEnter={() => handleMouseEnter(index + 1)}
          onClick={() => handleClick(index + 1)}
          className={`
            transition-transform duration-150
            ${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"}
            disabled:cursor-not-allowed disabled:hover:scale-100
          `}
          style={{ background: "none", border: "none", padding: 0 }}
        >
          {renderStar(index)}
        </button>
      ))}
    </div>
  )
}

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
          ({reviewCount})
        </span>
      )}
    </div>
  )
}
