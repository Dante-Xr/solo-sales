/**
 * ============================================
 * 积分余额组件 (v0.5.5)
 * ============================================
 * 功能说明：
 *   - 显示用户积分余额
 *   - 显示会员等级
 * ============================================
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Coins, Crown } from "lucide-react"

interface CustomerPoints {
  balance: number
  totalEarned: number
  totalRedeemed: number
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
}

interface PointsBalanceProps {
  userId: string
  isZh?: boolean
}

const tierColors = {
  BRONZE: "bg-amber-100 text-amber-800 border-amber-200",
  SILVER: "bg-slate-100 text-slate-800 border-slate-200",
  GOLD: "bg-warning/10 text-warning border-warning/20",
  PLATINUM: "bg-purple-100 text-purple-800 border-purple-200",
}

const tierNames = {
  BRONZE: { zh: "青铜", en: "Bronze" },
  SILVER: { zh: "白银", en: "Silver" },
  GOLD: { zh: "黄金", en: "Gold" },
  PLATINUM: { zh: "白金", en: "Platinum" },
}

export function PointsBalance({ userId, isZh = false }: PointsBalanceProps) {
  const [points, setPoints] = useState<CustomerPoints | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response = await fetch(`/api/points?userId=${userId}`)
        const result = await response.json()
        if (result.success) {
          setPoints(result.data)
        }
      } catch (error: unknown) {
        console.error("获取积分失败:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchPoints()
    }
  }, [userId])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!points) {
    return null
  }

  const tierName = tierNames[points.tier][isZh ? "zh" : "en"]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Coins size={24} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{points.balance}</span>
                <span className="text-muted-foreground">
                  {isZh ? "积分" : "Points"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {isZh ? "累计获得" : "Total Earned"}: {points.totalEarned} |{" "}
                {isZh ? "已兑换" : "Redeemed"}: {points.totalRedeemed}
              </p>
            </div>
          </div>

          <Badge className={`${tierColors[points.tier]} border`}>
            <Crown size={12} className="mr-1" />
            {tierName}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}