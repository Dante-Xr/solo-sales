/**
 * ============================================
 * 评论列表组件 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 展示商品的评论列表
 *   - 支持分页加载
 *   - 支持排序
 * ============================================
 */

"use client"

import { useState } from "react"
import { ReviewCard } from "./ReviewCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Review {
  id: string
  rating: number
  title?: string
  content?: string
  images?: { id: string; url: string }[]
  helpfulCount: number
  isFeatured: boolean
  isApproved: boolean
  createdAt: string
  user: { id: string; name: string; email: string }
  replies?: {
    id: string
    content: string
    createdAt: string
    user?: { id: string; name: string }
    admin?: { id: string; username: string }
  }[]
}

interface ReviewListProps {
  /** 商品 ID */
  productId: string
  /** 初始评论数据 */
  initialReviews?: Review[]
  /** 初始统计数据 */
  initialStats?: {
    averageRating: number
    totalReviews: number
    ratingDistribution: Record<number, number>
  }
}

/**
 * 评论列表组件
 */
export function ReviewList({
  productId,
  initialReviews = [],
  initialStats = { averageRating: 0, totalReviews: 0, ratingDistribution: {} },
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [_stats, setStats] = useState(initialStats)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialReviews.length >= 10)
  const [isLoading, setIsLoading] = useState(false)
  const [sort, setSort] = useState<"createdAt" | "rating" | "helpfulCount">("createdAt")

  // 加载更多评论
  const loadMore = async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/reviews?productId=${productId}&page=${page + 1}&pageSize=10&sort=${sort}`
      )
      const result = await response.json()

      if (result.success) {
        setReviews((prev) => [...prev, ...result.data.reviews])
        setStats(result.data.stats)
        setPage((prev) => prev + 1)
        setHasMore(result.data.reviews.length >= 10)
      }
    } catch (error) {
      console.error("加载评论失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理排序变化
  const handleSortChange = async (newSort: "createdAt" | "rating" | "helpfulCount") => {
    setSort(newSort)
    setPage(1)
    setIsLoading(true)

    try {
      const response = await fetch(
        `/api/reviews?productId=${productId}&page=1&pageSize=10&sort=${newSort}`
      )
      const result = await response.json()

      if (result.success) {
        setReviews(result.data.reviews)
        setStats(result.data.stats)
        setHasMore(result.data.reviews.length >= 10)
      }
    } catch (error) {
      console.error("加载评论失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理点赞
  const handleHelpful = async (reviewId: string) => {
    // TODO(v1.8): 实现点赞 API 调用
    // 需要新增 POST /api/reviews/[id]/helpful 端点
    void reviewId
  }

  // 处理回复
  const handleReply = async (reviewId: string) => {
    // TODO(v1.8): 实现回复表单弹窗
    // 需要新增 ReplyModal 组件和 POST /api/reviews/[id]/replies 调用
    void reviewId
  }

  return (
    <div className="space-y-6">
      {/* 排序选项 */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">排序:</span>
        <div className="flex gap-2">
          <Button
            variant={sort === "createdAt" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSortChange("createdAt")}
          >
            最新
          </Button>
          <Button
            variant={sort === "rating" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSortChange("rating")}
          >
            评分最高
          </Button>
          <Button
            variant={sort === "helpfulCount" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSortChange("helpfulCount")}
          >
            最有帮助
          </Button>
        </div>
      </div>

      {/* 评论列表 */}
      <div className="space-y-4">
        {reviews.length === 0 && !isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>暂无评价</p>
            <p className="text-sm mt-1">成为第一个评价该商品的用户</p>
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onHelpful={handleHelpful}
              onReply={handleReply}
            />
          ))
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 加载更多 */}
      {hasMore && !isLoading && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={loadMore}>
            加载更多评论
          </Button>
        </div>
      )}

      {/* 无更多评论 */}
      {!hasMore && reviews.length > 0 && (
        <p className="text-center text-sm text-muted-foreground pt-4">
          已显示全部 {reviews.length} 条评论
        </p>
      )}
    </div>
  )
}