"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

const WelcomeModal = dynamic(
  () => import("@/components/storefront/WelcomeModal").then(mod => mod.WelcomeModal),
  {
    ssr: false,
    loading: () => null
  }
)

export function WelcomeModalWrapper() {
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const hasVisited = localStorage.getItem("solo_has_visited")
    const couponClaimed = localStorage.getItem("solo_coupon_claimed")

    if (!hasVisited || !couponClaimed) {
      const timer = setTimeout(() => {
        setShowWelcome(true)
        localStorage.setItem("solo_has_visited", "true")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClaimCoupon = (code: string) => {
    console.log("Coupon claimed:", code)
  }

  if (!showWelcome) return null

  return (
    <div id="welcome-modal-container">
      <WelcomeModal
        onClose={() => setShowWelcome(false)}
        onClaim={handleClaimCoupon}
      />
    </div>
  )
}
