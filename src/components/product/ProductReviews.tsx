/**
 * 修改时间：2026-05-02 21:19:13 +08:00
 * 修改内容：清理商品评论组件未使用的 ReviewForm 导入，推进 M5 lint warnings 收敛。
 * 修改模型：gpt-5.5
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { PenLine } from "lucide-react"
import { useCsrfToken } from "@/hooks/useCsrfToken"
import { ReviewSummary } from "./ReviewSummary"
import { ReviewList } from "./ReviewList"
import { StarRating } from "./StarRating"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const t = useTranslations("reviews")
  const { csrfHeaders } = useCsrfToken()
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {} as Record<number, number>,
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}&page=1&pageSize=1`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data?.stats) {
          setStats(result.data.stats)
        }
      })
      .catch(console.error)
  }, [productId])

  useEffect(() => {
    fetch("/api/auth/get-session")
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(!!data?.user)
      })
      .catch(() => setIsLoggedIn(false))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      if (rating === 0) {
        setError(t("selectRating"))
        return
      }

      setIsSubmitting(true)

      try {
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...csrfHeaders },
          body: JSON.stringify({
            productId,
            rating,
            title: title.trim() || null,
            content: content.trim() || null,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error?.message || t("submitFailed"))
        }

        setSuccess(true)
        setRating(0)
        setTitle("")
        setContent("")

        setTimeout(() => {
          setSuccess(false)
          setDialogOpen(false)
        }, 2000)
      } catch (err) {
        setError(err instanceof Error ? err.message : t("submitFailed"))
      } finally {
        setIsSubmitting(false)
      }
    },
    [productId, rating, title, content, t]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold">{t("title")}</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button size="sm" className="gap-1.5" />}>
            <PenLine size={14} />
            {t("writeReview")}
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("writeReview")}</DialogTitle>
            </DialogHeader>

            {!isLoggedIn ? (
              <div className="py-6 text-center text-muted-foreground">
                <p>{t("loginRequired")}</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    window.location.href = "/login"
                  }}
                >
                  {t("goLogin")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                {success && (
                  <p className="text-sm text-success">{t("submitSuccess")}</p>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("rating")}</label>
                  <div className="flex items-center gap-3">
                    <StarRating
                      rating={rating}
                      size={28}
                      readOnly={false}
                      onChange={setRating}
                    />
                    <span className="text-sm text-muted-foreground">
                      {rating > 0 ? `${rating} ${t("stars")}` : t("selectRating")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="review-title" className="text-sm font-medium">
                    {t("reviewTitleOptional")}
                  </label>
                  <Input
                    id="review-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("titlePlaceholder")}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="review-content" className="text-sm font-medium">
                    {t("reviewContent")}
                  </label>
                  <Textarea
                    id="review-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={t("contentPlaceholder")}
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {content.length}/1000
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || success}
                  >
                    {isSubmitting ? t("submitting") : t("submitReview")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <ReviewSummary
        averageRating={stats.averageRating}
        totalReviews={stats.totalReviews}
        ratingDistribution={stats.ratingDistribution}
      />

      <ReviewList productId={productId} />
    </div>
  )
}
