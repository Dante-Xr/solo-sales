"use client"

// 2026-04-13: 更新为使用 next-intl 国际化

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

interface WelcomeModalProps {
  onClose: () => void
  onClaim: (couponCode: string) => void
}

export function WelcomeModal({ onClose, onClaim }: WelcomeModalProps) {
  const t = useTranslations('welcome')
  const locale = useLocale()

  const handleClaim = () => {
    const couponCode = "NEWUSER5"
    localStorage.setItem("solo_new_user_coupon", couponCode)
    localStorage.setItem("solo_coupon_claimed", "true")
    onClaim(couponCode)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="relative bg-card text-card-foreground rounded-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 顶部装饰 */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 pt-10 text-center">
          <div className="text-5xl mb-2">🎁</div>
          <h2 className="text-2xl font-bold text-white">
            {t("title")}
          </h2>
        </div>

        {/* 内容 */}
        <div className="p-6 text-center">
          <div className="text-4xl font-black text-price mb-2">$5 OFF</div>
          <p className="text-muted-foreground mb-6">
            {t("description")}
          </p>

          <div className="bg-muted rounded-lg p-3 mb-6">
            <div className="text-xs text-muted-foreground mb-1">
              {t("couponCode")}
            </div>
            <div className="text-lg font-mono font-bold">NEWUSER5</div>
          </div>

          <Button
            onClick={handleClaim}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-6 text-lg font-bold rounded-xl"
          >
            {t("claimNow")}
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            {t("validity")}
          </p>
        </div>
      </div>
    </div>
  )
}
