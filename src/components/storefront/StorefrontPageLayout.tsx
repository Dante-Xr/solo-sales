"use client"

import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useRouter, Link } from "@/i18n/navigation"
import { ShoppingBag, Sun, Moon, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ViewportWrapper } from "@/components/storefront/ViewportWrapper"
import { ViewportModeToggle } from "@/components/storefront/ViewportModeToggle"
import { LanguageSwitcher } from "@/components/storefront/LanguageSwitcher"
import { MobileMenu } from "@/components/storefront/MobileMenu"
import { UserMenu } from "@/components/storefront/UserMenu"
import { useCartStore } from "@/stores/useCartStore"

interface StorefrontPageLayoutProps {
  children: React.ReactNode
  title?: string
  showBack?: boolean
  backHref?: string
  headerRight?: React.ReactNode
  showDecorBg?: boolean
}

/**
 * 店铺统一页面布局组件
 * @description 提供统一的 Header、装饰背景和内容容器，
 *   移动端和桌面端使用不同的 Header 布局，
 *   通过 ViewportWrapper 包裹以支持视口模式切换。
 */
export function StorefrontPageLayout({
  children,
  title,
  showBack = false,
  backHref,
  headerRight,
  showDecorBg = false,
}: StorefrontPageLayoutProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { cartCount } = useCartStore()

  /** 跳转购物车页 */
  const handleCartClick = () => {
    router.push("/cart")
  }

  /** 返回上一页或指定路径 */
  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <ViewportWrapper>
      {/* 统一 Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
        <div className="px-3 md:px-4">
          <div className="flex items-center justify-between h-12">
            {/* 移动端左侧：返回按钮 + Logo/标题 */}
            <div className="flex items-center gap-1 md:hidden">
              {showBack && (
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <Link href="/" className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-gradient-from to-brand-gradient-to flex items-center justify-center">
                  <span className="text-brand-foreground font-bold text-[10px]">S</span>
                </div>
                {title && <span className="text-sm font-bold text-foreground">{title}</span>}
              </Link>
            </div>

            {/* 移动端右侧：菜单 + 购物车 + 用户 */}
            <div className="flex items-center gap-0 md:hidden">
              <MobileMenu />
              <Button variant="ghost" size="icon" className="relative w-8 h-8" onClick={handleCartClick}>
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand text-brand-foreground text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
              <UserMenu />
            </div>

            {/* 桌面端左侧：返回按钮 + Logo + 标题 */}
            <div className="hidden md:flex items-center gap-1.5">
              {showBack && (
                <Button variant="ghost" size="icon" className="w-9 h-9" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <Link href="/" className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-gradient-from to-brand-gradient-to flex items-center justify-center">
                  <span className="text-brand-foreground font-bold text-xs">S</span>
                </div>
                <span className="text-sm font-bold text-foreground">Solo Sales</span>
              </Link>
              {title && (
                <span className="text-sm text-muted-foreground">/ {title}</span>
              )}
            </div>

            {/* 桌面端右侧：视口切换 + 主题 + 语言 + 购物车 + 用户 + 自定义 */}
            <div className="hidden md:flex items-center gap-0.5">
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
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand text-brand-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
              <UserMenu />
              {headerRight}
            </div>
          </div>
        </div>
      </header>

      {/* 装饰背景：两个模糊渐变圆 */}
      {showDecorBg && (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand/5 rounded-full blur-3xl" />
        </div>
      )}

      {/* 主内容区 */}
      <main className="max-w-[1440px] mx-auto">
        {children}
      </main>
    </ViewportWrapper>
  )
}
