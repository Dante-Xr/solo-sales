"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Globe, Sun, Moon, Search, X } from "lucide-react"
import { HomeCarousel } from "@/components/storefront/HomeCarousel"
import { SearchBox } from "@/components/storefront/SearchBox"
import { UserMenu } from "@/components/storefront/UserMenu"
import { ProductGrid } from "@/components/storefront/ProductGrid"
import { FeatureSection } from "@/components/storefront/FeatureSection"
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter"
import { useCart } from "@/context/CartContext"
import { useLanguage } from "@/context/LanguageContext"
import { useTheme } from "@/components/providers/ThemeProvider"

const WelcomeModal = dynamic(
  () => import("@/components/storefront/WelcomeModal").then(mod => mod.WelcomeModal),
  {
    ssr: false,
    loading: () => null
  }
)

const navItems = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.shop", href: "/products" },
  { labelKey: "nav.about", href: "/about" },
  { labelKey: "nav.contact", href: "/contact" },
]

export default function Storefront() {
  const router = useRouter()
  const { cartCount } = useCart()
  const { language, toggleLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    console.log("Storefront mounted")
    setMounted(true)
    const hasVisited = localStorage.getItem("solo_has_visited")
    const couponClaimed = localStorage.getItem("solo_coupon_claimed")

    if (!hasVisited || !couponClaimed) {
      const timer = setTimeout(() => {
        console.log("Showing welcome modal")
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
    console.log("Cart clicked, navigating to /cart")
    router.push("/cart")
  }

  const handleThemeClick = () => {
    console.log("Theme clicked, current theme:", theme)
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleLanguageClick = () => {
    console.log("Language clicked, current language:", language)
    toggleLanguage()
  }

  const isZh = language === "zh"

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[1440px] mx-auto">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="px-4 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <span className="text-xl font-bold text-foreground hidden sm:block">SoloSales</span>
                </Link>

                <nav className="hidden lg:flex items-center gap-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isZh ? item.labelKey.replace("nav.", "") : item.labelKey.replace("nav.", "")}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="hidden lg:flex items-center gap-3 flex-1 max-w-xl px-8">
                <SearchBox onSearch={(query) => console.log("Search:", query)} />
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => {
                    console.log("Mobile menu toggle clicked")
                    setMobileMenuOpen(!mobileMenuOpen)
                  }}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                </Button>

                {mounted && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleThemeClick}
                  >
                    {theme === "dark" ? (
                      <Sun className="w-5 h-5 text-foreground" />
                    ) : (
                      <Moon className="w-5 h-5 text-foreground" />
                    )}
                  </Button>
                )}

                <Button variant="ghost" size="icon" onClick={handleLanguageClick}>
                  <Globe className="w-5 h-5 text-foreground" />
                </Button>

                <UserMenu />

                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={handleCartClick}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {mounted && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {mobileMenuOpen && (
              <div className="lg:hidden py-4 border-t border-border">
                <SearchBox onSearch={(query) => console.log("Search:", query)} />
                <nav className="flex flex-col gap-2 mt-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {isZh ? item.labelKey.replace("nav.", "") : item.labelKey.replace("nav.", "")}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </header>

        <main className="flex flex-col">
          <section className="w-full" style={{ height: "450px" }}>
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
          <WelcomeModal
            onClose={() => setShowWelcome(false)}
            onClaim={handleClaimCoupon}
          />
        )}
      </div>
    </div>
  )
}
