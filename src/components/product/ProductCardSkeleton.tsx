/**
 * ============================================
 * 商品卡片骨架屏 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 商品列表页加载占位
 *   - 提升加载体验
 * ============================================
 */

import { Skeleton } from "@/components/ui/skeleton"

interface ProductCardSkeletonProps {
  /** 是否显示列头 */
  showHeader?: boolean
}

/**
 * 商品卡片骨架屏
 */
export function ProductCardSkeleton({ showHeader: _showHeader = false }: ProductCardSkeletonProps) {
  return (
    <div className="space-y-3">
      {/* 图片 */}
      <Skeleton className="h-[200px] w-full rounded-lg" />

      {/* 标题 */}
      <Skeleton className="h-4 w-3/4" />

      {/* 价格 */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* 评分 */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

/**
 * 商品卡片网格骨架屏
 */
export function ProductGridSkeleton({
  count = 8,
}: {
  count?: number
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * 商品列表骨架屏
 */
export function ProductListSkeleton({
  count = 5,
}: {
  count?: number
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex gap-4 p-4 border rounded-lg">
          <Skeleton className="h-24 w-24 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
          <div className="flex flex-col items-end justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      ))}
    </div>
  )
}