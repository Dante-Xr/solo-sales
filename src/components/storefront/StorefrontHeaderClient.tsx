"use client"

import { Link, useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Sun, Moon } from "lucide-react"
import { SearchBoxClient } from "@/components/storefront/SearchBoxClient"
import { UserMenu } from "@/components/storefront/UserMenu"
import { LanguageSwitcher } from "@/components/storefront/LanguageSwitcher"
import { ViewportModeToggle } from "@/components/storefront/ViewportModeToggle"
import { MobileMenu } from "@/components/storefront/MobileMenu"
import { useCartStore } from "@/stores/useCartStore"
import { useViewportModeStore } from "@/stores/useViewportModeStore"
import { useTheme } from "next-themes"

export function StorefrontHeaderClient() {
  const router = useRouter()
  const { cartCount } = useCartStore()
  const { theme, setTheme } = useTheme()
  const { mode: viewportMode } = useViewportModeStore()
  const isMobileView = viewportMode === "mobile"

  const handleCartClick = () => {
    router.push("/cart")
  }

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
      <div className="px-3 md:px-4">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <Link href="/" className="flex items-center gap-1.5 md:gap-2">
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-[10px] md:text-xs">S</span>
              </div>
              <span className={`text-sm md:text-base font-bold ${isMobileView ? "" : "hidden sm:inline"}`}>
                Solo Sales
              </span>
            </Link>
          </div>

          {/* Mobile: Hamburger Menu + Cart + User */}
          <div className={`flex items-center gap-0 ${isMobileView ? "flex" : "md:hidden"}`}>
            <MobileMenu />
            <Button variant="ghost" size="icon" className="relative w-8 h-8" onClick={handleCartClick}>
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">{cartCount}</span>
              )}
            </Button>
            <UserMenu />
          </div>

          {/* Desktop: Original buttons */}
          <div className={`${isMobileView ? "hidden" : "hidden md:flex"} items-center gap-0.5`}>
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

        {/* Search Box */}
        <div className="pb-2 md:pb-3">
          <SearchBoxClient onSearch={(query) => console.log("Search:", query)} />
        </div>
      </div>
    </header>
  )
}
