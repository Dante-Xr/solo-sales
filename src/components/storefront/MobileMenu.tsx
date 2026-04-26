"use client"

import { useState, useRef, useEffect } from "react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Menu, X, Globe, Sun, Moon, Monitor, Smartphone, Check, Home, ShoppingBag, User, Search } from "lucide-react"
import { useViewportModeStore } from "@/stores/useViewportModeStore"
import { Link } from "@/i18n/navigation"

/** 页面导航链接配置 */
const PAGE_NAV_LINKS = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/search", labelKey: "nav.shop", icon: Search },
  { href: "/cart", labelKey: "nav.cart", icon: ShoppingBag },
  { href: "/profile", labelKey: "nav.profile", icon: User },
]

const LANGUAGES = [
  { code: "zh" as const, label: "中文" },
  { code: "en" as const, label: "English" },
]

export function MobileMenu() {
  const locale = useLocale()
  const t = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { mode, toggleMode } = useViewportModeStore()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleLanguageSelect = (code: string) => {
    setIsOpen(false)
    if (code !== locale) {
      router.push(pathname, { locale: code })
      setTimeout(() => router.refresh(), 100)
    }
  }

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleViewportToggle = () => {
    toggleMode()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 animate-in fade-in-0 zoom-in-95">
          {/* 页面导航链接 */}
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
            {t("nav.shopName")}
          </div>
          {PAGE_NAV_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-accent transition-colors"
              >
                <Icon className="w-4 h-4" />
                {t(link.labelKey)}
              </Link>
            )
          })}

          {/* Divider */}
          <div className="border-t my-1" />

          {/* Language Section */}
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
            Language/语言
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-accent transition-colors"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {lang.label}
              </span>
              {locale === lang.code && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}

          {/* Divider */}
          <div className="border-t my-1" />

          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-accent transition-colors"
          >
            <span className="flex items-center gap-2">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === "dark" ? t("theme.lightMode") : t("theme.darkMode")}
            </span>
          </button>

          {/* Viewport Toggle */}
          <button
            onClick={handleViewportToggle}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-accent transition-colors"
          >
            <span className="flex items-center gap-2">
              {mode === "mobile" ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              {mode === "mobile" ? t("viewport.switchToDesktop") : t("viewport.switchToMobile")}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
