/**
 * ============================================
 * 下拉刷新 Hook (v0.4.1)
 * ============================================
 * 功能说明：
 *   - 下拉刷新内容
 *   - 下拉超过 60px 触发刷新
 *   - 显示 loading 状态
 * ============================================
 */

"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface UsePullToRefreshOptions {
  threshold?: number
  onRefresh: () => Promise<void>
  disabled?: boolean
}

interface UsePullToRefreshReturn {
  isRefreshing: boolean
  pullDistance: number
  isPulling: boolean
  containerRef: React.RefObject<HTMLDivElement | null>
  indicatorStyle: React.CSSProperties
}

export function usePullToRefresh({
  threshold = 60,
  onRefresh,
  disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const startYRef = useRef<number | null>(null)
  const currentYRef = useRef<number | null>(null)

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
      setPullDistance(0)
      setIsPulling(false)
    }
  }, [onRefresh])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || startYRef.current === null || disabled || isRefreshing) return

    currentYRef.current = e.touches[0].clientY
    const distance = currentYRef.current - startYRef.current

    if (distance > 0) {
      e.preventDefault()
      const pullDistance = Math.min(distance * 0.5, threshold * 1.5)
      setPullDistance(pullDistance)
    }
  }, [isPulling, disabled, isRefreshing, threshold])

  const handleTouchEnd = useCallback(() => {
    if (!isPulling || disabled) return

    if (pullDistance >= threshold && !isRefreshing) {
      handleRefresh()
    } else {
      setPullDistance(0)
    }

    setIsPulling(false)
    startYRef.current = null
    currentYRef.current = null
  }, [isPulling, disabled, pullDistance, threshold, isRefreshing, handleRefresh])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("touchstart", handleTouchStart, { passive: true })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const indicatorStyle: React.CSSProperties = {
    height: pullDistance > 0 ? `${pullDistance}px` : "0px",
    transition: pullDistance === 0 ? "height 0.3s ease-out" : "none",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }

  return {
    isRefreshing,
    pullDistance,
    isPulling,
    containerRef,
    indicatorStyle,
  }
}
