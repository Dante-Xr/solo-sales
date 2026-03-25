/**
 * ============================================
 * 优惠券输入组件 (v0.5.5)
 * ============================================
 * 功能说明：
 *   - 优惠券码输入
 *   - 优惠券校验和应用
 * ============================================
 */

"use client"

import { useState } from "react"
import { useCart } from "@/context/CartContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tag, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface CouponInputProps {
  onApply?: (coupon: unknown, discount: number) => void
  onRemove?: () => void
  isZh?: boolean
}

export function CouponInput({ onApply, onRemove, isZh = false }: CouponInputProps) {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    name: string
    discount: number
  } | null>(null)

  const { cartTotal } = useCart()

  const handleApply = async () => {
    if (!code.trim()) {
      setError(isZh ? "请输入优惠券码" : "Please enter coupon code")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          cartTotal,
          userId: "guest",
        }),
      })

      const result = await response.json()

      if (result.data?.valid) {
        setAppliedCoupon({
          code: result.data.coupon.code,
          name: result.data.coupon.name,
          discount: result.data.discount,
        })
        onApply?.(result.data.coupon, result.data.discount)
      } else {
        setError(result.data?.error || (isZh ? "优惠券无效" : "Invalid coupon"))
      }
    } catch (err) {
      setError(isZh ? "校验失败，请重试" : "Validation failed, please retry")
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setCode("")
    setAppliedCoupon(null)
    setError(null)
    onRemove?.()
  }

  if (appliedCoupon) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-600" />
              <div>
                <p className="font-medium text-green-700">{appliedCoupon.name}</p>
                <p className="text-sm text-green-600">
                  -{appliedCoupon.discount.toFixed(2)}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRemove}>
              <XCircle size={16} className="mr-1" />
              {isZh ? "移除" : "Remove"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={isZh ? "输入优惠券码" : "Enter coupon code"}
            className="pl-9 font-mono"
            disabled={loading}
          />
        </div>
        <Button onClick={handleApply} disabled={loading || !code.trim()}>
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isZh ? (
            "应用"
          ) : (
            "Apply"
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}