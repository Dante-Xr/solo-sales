/**
 * ============================================
 * 商品详情页骨架屏 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 商品详情页加载占位
 *   - 包含图片、标题、价格、操作按钮等
 * ============================================
 */

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

interface ProductDetailSkeletonProps {
  /** 布局模式 */
  variant?: "default" | "compact"
}

/**
 * 商品详情页骨架屏
 */
export function ProductDetailSkeleton({ variant = "default" }: ProductDetailSkeletonProps) {
  if (variant === "compact") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 图片区域 */}
        <div className="space-y-3">
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-16 rounded" />
            ))}
          </div>
        </div>

        {/* 信息区域 */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />

          <div className="border-t border-b py-4 my-4">
            <Skeleton className="h-10 w-1/3 mb-2" />
            <Skeleton className="h-6 w-1/4" />
          </div>

          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1 rounded-lg" />
            <Skeleton className="h-12 flex-1 rounded-lg" />
          </div>

          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className="space-y-6">
      {/* 面包屑 */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧: 图片 */}
        <div className="space-y-3">
          <Skeleton className="h-[500px] w-full rounded-xl" />
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-lg" />
            ))}
          </div>
        </div>

        {/* 右侧: 信息 */}
        <div className="space-y-5">
          {/* 标题和评分 */}
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>

          {/* 价格 */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-baseline gap-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>

          {/* 选项 */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-16 rounded-lg" />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-lg" />
              ))}
            </div>
          </div>

          {/* 数量和按钮 */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-32 rounded-lg" />
            <Skeleton className="h-12 flex-1 rounded-lg" />
          </div>

          {/* 信任徽章 */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 评论列表骨架屏
 */
export function ReviewListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}