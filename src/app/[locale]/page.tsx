"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Link, useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Sun, Moon } from "lucide-react"
import { HomeCarousel } from "@/components/storefront/HomeCarousel"
import { SearchBox } from "@/components/storefront/SearchBox"
import { UserMenu } from "@/components/storefront/UserMenu"
import { ProductGrid } from "@/components/storefront/ProductGrid"
import { FeatureSection } from "@/components/storefront/FeatureSection"
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter"
import { LanguageSwitcher } from "@/components/storefront/LanguageSwitcher"
import { ViewportModeToggle } from "@/components/storefront/ViewportModeToggle"
import { ViewportWrapper } from "@/components/storefront/ViewportWrapper"
import { useCartStore } from "@/stores/useCartStore"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"

const WelcomeModal = dynamic(
  () => import("@/components/storefront/WelcomeModal").then(mod => mod.WelcomeModal),
  {
    ssr: false,
    loading: () => null
  }
)

export default function Storefront() {
  const router = useRouter()
  const t = useTranslations()
  const { cartCount } = useCartStore()
  const { theme, setTheme } = useTheme()
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

  const handleCartClick = () => {
    router.push("/cart")
  }

  return (
    <ViewportWrapper>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[1440px] mx-auto relative">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="px-3">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">Solo Sales</span>
                </Link>
              </div>

              <div className="flex items-center gap-0.5">
                <ViewportModeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-foreground" />
                  ) : (
                    <Moon className="w-4 h-4 text-foreground" />
                  )}
                </Button>
                <LanguageSwitcher />
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative w-9 h-9"
                  onClick={handleCartClick}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
                <UserMenu />
              </div>
            </div>

            <div className="pb-3">
              <SearchBox onSearch={(query) => console.log("Search:", query)} />
            </div>
          </div>
        </header>

        <main className="flex flex-col pb-16">
          <section className="w-full">
            <div className="h-full">
              <HomeCarousel />
            </div>
          </section>

          <section className="w-full">
            <ProductGrid />
          </section>

          <section className="w-full">
            <FeatureSection />
          </section>

          <section className="w-full">
            <StorefrontFooter />
          </section>
        </main>

        {showWelcome && (
          <div id="welcome-modal-container">
            <WelcomeModal
              onClose={() => setShowWelcome(false)}
              onClaim={handleClaimCoupon}
            />
          </div>
        )}
      </div>
    </div>
    </ViewportWrapper>
  )
}
