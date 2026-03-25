/**
 * ============================================
 * 评论卡片组件 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 展示单个评论的完整信息
 *   - 包含用户信息、评分、内容、图片、回复
 *   - 支持点赞和回复功能
 * ============================================
 */

"use client"

import { useState } from "react"
import Image from "next/image"
import { ThumbsUp, MessageCircle, ChevronDown, ChevronUp } from "lucide-react"
import { StarRating } from "./StarRating"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ReviewImage {
  id: string
  url: string
}

interface ReviewReply {
  id: string
  content: string
  createdAt: string
  user?: { id: string; name: string }
  admin?: { id: string; username: string }
}

interface ReviewCardProps {
  /** 评论数据 */
  review: {
    id: string
    rating: number
    title?: string
    content?: string
    images?: ReviewImage[]
    helpfulCount: number
    isFeatured: boolean
    createdAt: string
    user: {
      id: string
      name: string
      email: string
    }
    replies?: ReviewReply[]
  }
  /** 是否显示商品信息 */
  showProduct?: boolean
  /** 商品名称 (可选) */
  productName?: string
  /** 是否展开回复 */
  defaultShowReplies?: boolean
  /** 点赞回调 */
  onHelpful?: (reviewId: string) => void
  /** 回复回调 */
  onReply?: (reviewId: string) => void
}

/**
 * 评论卡片组件
 */
export function ReviewCard({
  review,
  showProduct = false,
  productName,
  defaultShowReplies = false,
  onHelpful,
  onReply,
}: ReviewCardProps) {
  const [showReplies, setShowReplies] = useState(defaultShowReplies)
  const [isHelpful, setIsHelpful] = useState(false)
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount)

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // 获取用户名称首字母
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  // 处理点赞
  const handleHelpful = () => {
    if (!isHelpful) {
      setIsHelpful(true)
      setHelpfulCount((prev) => prev + 1)
      onHelpful?.(review.id)
    }
  }

  // 切换回复显示
  const toggleReplies = () => {
    setShowReplies((prev) => !prev)
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* 头部: 用户信息和评分 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(review.user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{review.user.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <StarRating rating={review.rating} size={14} readOnly />
                <span>•</span>
                <span>{formatDate(review.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* 精选标识 */}
          {review.isFeatured && (
            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
              精选
            </span>
          )}
        </div>

        {/* 商品名称 (可选显示) */}
        {showProduct && productName && (
          <p className="text-sm text-muted-foreground">
            商品: {productName}
          </p>
        )}

        {/* 评价标题 */}
        {review.title && (
          <p className="font-medium text-foreground">{review.title}</p>
        )}

        {/* 评价内容 */}
        {review.content && (
          <p className="text-sm text-foreground leading-relaxed">
            {review.content}
          </p>
        )}

        {/* 评价图片 */}
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-1">
            {review.images.map((image) => (
              <div
                key={image.id}
                className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border"
              >
                <Image
                  src={image.url}
                  alt="评价图片"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHelpful}
            className={`gap-1.5 text-muted-foreground ${
              isHelpful ? "text-primary" : ""
            }`}
          >
            <ThumbsUp size={16} className={isHelpful ? "fill-current" : ""} />
            <span>有帮助</span>
            {helpfulCount > 0 && <span>({helpfulCount})</span>}
          </Button>

          {review.replies && review.replies.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleReplies}
              className="gap-1.5 text-muted-foreground"
            >
              <MessageCircle size={16} />
              <span>回复</span>
              <span>({review.replies.length})</span>
              {showReplies ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </Button>
          )}

          {(!review.replies || review.replies.length === 0) && onReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(review.id)}
              className="gap-1.5 text-muted-foreground"
            >
              <MessageCircle size={16} />
              <span>回复</span>
            </Button>
          )}
        </div>

        {/* 回复列表 */}
        {showReplies && review.replies && review.replies.length > 0 && (
          <div className="space-y-3 pl-4 border-l-2 border-muted">
            {review.replies.map((reply) => (
              <div key={reply.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {reply.admin?.username || reply.user?.name || "未知用户"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {reply.admin ? "(商家)" : ""}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • {formatDate(reply.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground">{reply.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}