"use client"

import { Link, usePathname } from "@/i18n/navigation"
import { Home, Search, ShoppingBag, User } from "lucide-react"
import { useCartStore } from "@/stores/useCartStore"
import { useTranslations } from "next-intl"

/** 导航项接口 */
interface NavItem {
  href: string
  labelKey: string
  icon: React.ComponentType<{ className?: string }>
}

/** BottomNav 属性接口 */
interface BottomNavProps {
  items?: NavItem[]
  visible?: boolean
}

/** 默认导航项：首页/搜索/购物车/我的 */
const defaultItems: NavItem[] = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/search", labelKey: "nav.search", icon: Search },
  { href: "/cart", labelKey: "nav.cart", icon: ShoppingBag },
  { href: "/profile", labelKey: "nav.profile", icon: User },
]

/**
 * 底部 Tab 导航栏
 * @description 移动端固定底部导航，支持当前页高亮、购物车角标、safe-area 适配
 */
export function BottomNav({ items = defaultItems, visible = true }: BottomNavProps) {
  const pathname = usePathname()
  const cartCount = useCartStore((s) => s.cartCount)
  const t = useTranslations()

  if (!visible) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-t"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label={t("nav.bottomNav")}
    >
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          const isCart = item.href === "/cart"

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive ? "text-brand" : "text-muted-foreground"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="relative">
                <Icon className="w-5 h-5" />
                {/* 购物车角标 */}
                {isCart && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] leading-tight">{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
