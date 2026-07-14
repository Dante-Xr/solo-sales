"use client"

import { useState } from "react"
import { Link, useRouter, usePathname } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Sun, Moon, Search, ArrowLeft } from "lucide-react"
import { SearchBoxClient } from "@/components/storefront/SearchBoxClient"
import { UserMenu } from "@/components/storefront/UserMenu"
import { LanguageSwitcher } from "@/components/storefront/LanguageSwitcher"
import { ViewportModeToggle } from "@/components/storefront/ViewportModeToggle"
import { MobileMenu } from "@/components/storefront/MobileMenu"
import { useCartStore } from "@/stores/useCartStore"
import { useViewportModeStore } from "@/stores/useViewportModeStore"
import { useTheme } from "next-themes"

/** PC 端导航链接配置 */
const NAV_LINKS = [
  { href: "/", labelKey: "home" },
  { href: "/search", labelKey: "shop" },
  { href: "/about", labelKey: "about" },
  { href: "/contact", labelKey: "contact" },
] as const

export function StorefrontHeaderClient() {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations("nav")
  const { cartCount } = useCartStore()
  const { theme, setTheme } = useTheme()
  const { mode: viewportMode } = useViewportModeStore()
  const isMobileView = viewportMode === "mobile"

  /* 移动端全屏搜索覆盖层状态 */
  const [searchOpen, setSearchOpen] = useState(false)

  const handleCartClick = () => {
    router.push("/cart")
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo + PC端导航链接 */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <Link href="/" className="flex items-center gap-1.5 md:gap-2">
              <div className="grid size-9 place-items-center rounded-lg bg-foreground shadow-sm">
                <span className="text-brand-foreground font-bold text-[10px] md:text-xs">S</span>
              </div>
              <span className={`text-sm md:text-base font-bold text-foreground ${isMobileView ? "" : "hidden sm:inline"}`}>
                Solo Sales
              </span>
            </Link>

            {/* PC端水平导航链接（仅 lg 显示） */}
            <nav className="hidden lg:flex items-center gap-1 ml-4">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      isActive
                        ? "bg-muted text-brand font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    {t(link.labelKey)}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* 移动端：搜索图标 + 汉堡菜单 + 购物车 + 用户 */}
          <div className={`flex items-center gap-0 ${isMobileView ? "flex" : "flex lg:hidden"}`}>
            {/* 移动端搜索图标按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={() => setSearchOpen(true)}
              aria-label={t("searchPlaceholder")}
            >
              <Search className="w-4 h-4" />
            </Button>
            <MobileMenu />
            <Button variant="ghost" size="icon" className="relative w-8 h-8" onClick={handleCartClick}>
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand text-brand-foreground text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">{cartCount}</span>
              )}
            </Button>
            <UserMenu />
          </div>

          {/* 桌面端：搜索框 + 其他按钮 */}
          <div className={`${isMobileView ? "hidden" : "hidden lg:flex"} items-center gap-2 flex-1 max-w-xl mx-6`}>
            <SearchBoxClient onSearch={() => {}} compact />
          </div>

          {/* 桌面端：右侧按钮组 */}
          <div className={`${isMobileView ? "hidden" : "hidden lg:flex"} items-center gap-0.5`}>
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
                <span className="absolute -top-1 -right-1 bg-brand text-brand-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
            <UserMenu />
          </div>
        </div>

      </div>

      {/* 移动端全屏搜索覆盖层 */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2 px-3 h-12 border-b border-border">
            {/* 返回按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 flex-shrink-0"
              onClick={() => setSearchOpen(false)}
              aria-label={t("clear") ? "返回" : "Back"}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            {/* 搜索框 */}
            <div className="flex-1">
              <SearchBoxClient onSearch={() => setSearchOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
