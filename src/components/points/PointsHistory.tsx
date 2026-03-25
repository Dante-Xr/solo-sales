/**
 * ============================================
 * 积分历史组件 (v0.5.5)
 * ============================================
 * 功能说明：
 *   - 显示积分交易记录
 * ============================================
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Coins, Gift, TrendingUp, TrendingDown, Clock } from "lucide-react"

interface PointTransaction {
  id: string
  amount: number
  type: "EARN" | "REDEEM" | "BONUS" | "EXPIRE" | "ADJUST" | "REFUND"
  description: string
  createdAt: string
}

interface PointsHistoryProps {
  userId: string
  isZh?: boolean
}

const typeConfig = {
  EARN: { icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
  REDEEM: { icon: TrendingDown, color: "text-red-600", bg: "bg-red-100" },
  BONUS: { icon: Gift, color: "text-purple-600", bg: "bg-purple-100" },
  EXPIRE: { icon: Clock, color: "text-gray-600", bg: "bg-gray-100" },
  ADJUST: { icon: Coins, color: "text-blue-600", bg: "bg-blue-100" },
  REFUND: { icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-100" },
}

export function PointsHistory({ userId, isZh = false }: PointsHistoryProps) {
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`/api/points/transactions?userId=${userId}`)
        const result = await response.json()
        if (result.success) {
          setTransactions(result.data.transactions)
        }
      } catch (error) {
        console.error("获取积分记录失败:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchTransactions()
    }
  }, [userId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isZh ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isZh ? "积分记录" : "Points History"}</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {isZh ? "暂无积分记录" : "No transactions yet"}
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => {
              const config = typeConfig[tx.type]
              const Icon = config.icon
              const isPositive = tx.amount > 0

              return (
                <div key={tx.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${config.bg}`}>
                    <Icon size={16} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{tx.description}</p>
                      <span
                        className={`font-semibold ${
                          isPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {tx.amount}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}