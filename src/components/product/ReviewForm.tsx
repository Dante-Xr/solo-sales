/**
 * ============================================
 * 评论表单组件 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 提交新评论的表单
 *   - 包含评分、标题、内容、图片上传
 * ============================================
 */

"use client"

import { useState } from "react"
import { StarRating } from "./StarRating"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ReviewFormProps {
  /** 商品 ID */
  productId: string
  /** 当前用户 ID */
  userId: string
  /** 提交成功回调 */
  onSubmit?: (review: unknown) => void
  /** 取消回调 */
  onCancel?: () => void
}

/**
 * 评论表单组件
 */
export function ReviewForm({
  productId,
  userId,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 验证评分
    if (rating === 0) {
      setError("请选择评分")
      return
    }

    // 验证内容
    if (!content.trim()) {
      setError("请输入评价内容")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          userId,
          rating,
          title: title.trim() || null,
          content: content.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || "提交失败")
      }

      setSuccess(true)
      setRating(0)
      setTitle("")
      setContent("")

      // 调用成功回调
      onSubmit?.(result.data)

      // 3秒后隐藏成功提示
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败，请稍后重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">发表评价</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 成功提示 */}
          {success && (
            <Alert className="border-green-500 text-green-700">
              <AlertDescription>
                评价提交成功！等待审核后即可显示。
              </AlertDescription>
            </Alert>
          )}

          {/* 评分选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">评分</label>
            <div className="flex items-center gap-3">
              <StarRating
                rating={rating}
                size={28}
                readOnly={false}
                onChange={setRating}
              />
              <span className="text-sm text-muted-foreground">
                {rating > 0 ? `${rating} 星` : "请选择评分"}
              </span>
            </div>
          </div>

          {/* 评价标题 */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              评价标题 (可选)
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="简短描述您的购买体验"
              maxLength={100}
            />
          </div>

          {/* 评价内容 */}
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              评价内容 <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享您的购买体验，帮助其他买家做出更好的选择"
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/1000
            </p>
          </div>

          {/* 提交按钮 */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || success}
              className="bg-primary"
            >
              {isSubmitting ? "提交中..." : "提交评价"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                取消
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}