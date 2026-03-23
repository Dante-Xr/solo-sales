"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

interface WelcomeModalProps {
  onClose: () => void
  onClaim: (couponCode: string) => void
}

export function WelcomeModal({ onClose, onClaim }: WelcomeModalProps) {
  const { language } = useLanguage()
  const isZh = language === "zh"

  const handleClaim = () => {
    const couponCode = "NEWUSER5"
    localStorage.setItem("solo_new_user_coupon", couponCode)
    localStorage.setItem("solo_coupon_claimed", "true")
    onClaim(couponCode)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground rounded-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 顶部装饰 */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 pt-10 text-center">
          <div className="text-5xl mb-2">🎁</div>
          <h2 className="text-2xl font-bold text-white">
            {isZh ? "新人专属优惠" : "Welcome Gift"}
          </h2>
        </div>

        {/* 内容 */}
        <div className="p-6 text-center">
          <div className="text-4xl font-black text-red-500 dark:text-red-400 mb-2">$5 OFF</div>
          <p className="text-muted-foreground mb-6">
            {isZh
              ? "首单立减5美元，全场通用"
              : "$5 off your first order, valid on all products"}
          </p>

          <div className="bg-muted rounded-lg p-3 mb-6">
            <div className="text-xs text-muted-foreground mb-1">
              {isZh ? "优惠码" : "Coupon Code"}
            </div>
            <div className="text-lg font-mono font-bold">NEWUSER5</div>
          </div>

          <Button
            onClick={handleClaim}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-6 text-lg font-bold rounded-xl"
          >
            {isZh ? "立即领取" : "Claim Now"}
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            {isZh
              ? "* 有效期30天，不可与其他优惠叠加"
              : "* Valid for 30 days, cannot be combined with other offers"}
          </p>
        </div>
      </div>
    </div>
  )
}
