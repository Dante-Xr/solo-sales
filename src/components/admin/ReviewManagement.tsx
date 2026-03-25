/**
 * ============================================
 * 评论管理组件 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 后台评论审核管理
 *   - 支持评论审核、精选、删除操作
 * ============================================
 */

"use client"

import { useState, useEffect } from "react"
import { StarRating } from "@/components/product/StarRating"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Check, X, Star, Trash2, Eye, MessageCircle } from "lucide-react"

interface ReviewReply {
  id: string
  content: string
  createdAt: string
  admin?: { id: string; username: string }
  user?: { id: string; name: string }
}

interface Review {
  id: string
  rating: number
  title?: string
  content?: string
  isApproved: boolean
  isFeatured: boolean
  helpfulCount: number
  createdAt: string
  user: { id: string; name: string; email: string }
  product: { id: string; name: string }
  images: { id: string; url: string }[]
  replies: ReviewReply[]
}

interface ReviewManagementProps {
  isZh?: boolean
}

export function ReviewManagement({ isZh = false }: ReviewManagementProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/reviews")
      const result = await response.json()
      if (result.success) {
        setReviews(result.data.reviews)
      }
    } catch (error) {
      console.error("获取评论失败:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleAction = async (action: string, reviewIds: string[]) => {
    setActionLoading(true)
    try {
      const response = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reviewIds }),
      })
      const result = await response.json()
      if (result.success) {
        fetchReviews()
      }
    } catch (error) {
      console.error("操作失败:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReply = async (reviewId: string) => {
    if (!replyContent.trim()) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent,
          adminId: "admin",
        }),
      })
      const result = await response.json()
      if (result.success) {
        setReplyContent("")
        setSelectedReview(null)
        fetchReviews()
      }
    } catch (error) {
      console.error("回复失败:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isZh ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const pendingReviews = reviews.filter((r) => !r.isApproved)
  const approvedReviews = reviews.filter((r) => r.isApproved)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{isZh ? "评论管理" : "Review Management"}</span>
            <Badge variant="outline">
              {pendingReviews.length} {isZh ? "待审核" : "Pending"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {isZh ? "加载中..." : "Loading..."}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isZh ? "暂无评论" : "No reviews yet"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isZh ? "商品" : "Product"}</TableHead>
                  <TableHead>{isZh ? "用户" : "User"}</TableHead>
                  <TableHead>{isZh ? "评分" : "Rating"}</TableHead>
                  <TableHead>{isZh ? "内容" : "Content"}</TableHead>
                  <TableHead>{isZh ? "状态" : "Status"}</TableHead>
                  <TableHead>{isZh ? "日期" : "Date"}</TableHead>
                  <TableHead className="text-right">{isZh ? "操作" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="max-w-[150px] truncate">
                      {review.product.name}
                    </TableCell>
                    <TableCell>{review.user.name}</TableCell>
                    <TableCell>
                      <StarRating rating={review.rating} size={14} readOnly />
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {review.title || review.content || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {review.isApproved && (
                          <Badge variant="default" className="bg-green-500">
                            {isZh ? "已通过" : "Approved"}
                          </Badge>
                        )}
                        {review.isFeatured && (
                          <Badge variant="default" className="bg-yellow-500">
                            <Star size={12} className="mr-1" />
                            {isZh ? "精选" : "Featured"}
                          </Badge>
                        )}
                        {!review.isApproved && (
                          <Badge variant="destructive">
                            {isZh ? "待审核" : "Pending"}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(review.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedReview(review)}
                        >
                          <Eye size={16} />
                        </Button>
                        {!review.isApproved && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAction("approve", [review.id])}
                            disabled={actionLoading}
                          >
                            <Check size={16} className="text-green-500" />
                          </Button>
                        )}
                        {review.isApproved && !review.isFeatured && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAction("feature", [review.id])}
                            disabled={actionLoading}
                          >
                            <Star size={16} className="text-yellow-500" />
                          </Button>
                        )}
                        {review.isFeatured && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAction("unfeature", [review.id])}
                            disabled={actionLoading}
                          >
                            <X size={16} className="text-yellow-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAction("delete", [review.id])}
                          disabled={actionLoading}
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isZh ? "评论详情" : "Review Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedReview?.product.name}
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="font-medium">{selectedReview.user.name}</div>
                <StarRating rating={selectedReview.rating} size={16} readOnly />
                <div className="text-sm text-muted-foreground">
                  {formatDate(selectedReview.createdAt)}
                </div>
              </div>

              {selectedReview.title && (
                <div className="font-medium">{selectedReview.title}</div>
              )}

              {selectedReview.content && (
                <div className="text-sm">{selectedReview.content}</div>
              )}

              {selectedReview.images && selectedReview.images.length > 0 && (
                <div className="flex gap-2">
                  {selectedReview.images.map((img) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt="review"
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}

              {selectedReview.replies && selectedReview.replies.length > 0 && (
                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-2">
                    {isZh ? "回复" : "Replies"}
                  </div>
                  {selectedReview.replies.map((reply) => (
                    <div key={reply.id} className="text-sm mb-2">
                      <span className="font-medium">
                        {reply.admin?.username || reply.user?.name || "Unknown"}:
                      </span>
                      <span className="ml-2">{reply.content}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-4">
                <div className="text-sm font-medium mb-2">
                  {isZh ? "商家回复" : "Reply as Admin"}
                </div>
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={isZh ? "输入回复内容..." : "Enter reply..."}
                  rows={3}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedReview(null)}
                  >
                    {isZh ? "取消" : "Cancel"}
                  </Button>
                  <Button
                    onClick={() => handleReply(selectedReview.id)}
                    disabled={!replyContent.trim() || actionLoading}
                  >
                    <MessageCircle size={16} className="mr-2" />
                    {isZh ? "发送回复" : "Send Reply"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}