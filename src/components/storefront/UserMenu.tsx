/**
 * 修改时间：2026-05-02 21:19:13 +08:00
 * 修改内容：清理用户菜单未使用的语言切换导入与 locale 变量，推进 M5 lint warnings 收敛。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 用户菜单组件 (Phase 4 国际化升级)
 * ============================================
 * 2026-04-13: 更新为使用 next-intl 国际化
 * 功能说明：
 *   - 显示用户头像/登录按钮
 *   - 已登录用户显示下拉菜单（个人中心、订单、管理面板等）
 *   - 未登录用户显示登录/注册选项
 *   - 使用 Better Auth 的 useSession 获取会话状态
 *   - 使用 next-intl 进行国际化
 * ============================================
 */

"use client"

import { useState } from "react"
import { useSession, signOut } from "@/lib/auth-client"
import { useRouter } from "@/i18n/navigation"
import { User, ChevronDown, UserCircle, Package, Settings, LogOut, Sun, Moon, Monitor, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { AuthModal } from "@/components/auth/AuthModal"
import { useViewportModeStore } from "@/stores/useViewportModeStore"

const MENU_ITEM_CLASS = "w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground focus-visible:outline-none"

export function UserMenu() {
  const { data: session } = useSession()
  const router = useRouter()
  const t = useTranslations()
  const { theme, setTheme } = useTheme()
  const { mode, setMode } = useViewportModeStore()
  const [isOpen, setIsOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">('login')

  const isAdmin = session?.user?.role === 'admin'

  const handleMenuClick = (action: string) => {
    setIsOpen(false)
    switch (action) {
      case 'login':
        setAuthMode('login')
        setShowAuthModal(true)
        break
      case 'register':
        setAuthMode('register')
        setShowAuthModal(true)
        break
      case 'profile':
        router.push('/profile')
        break
      case 'orders':
        router.push('/orders')
        break
      case 'admin':
        router.push('/admin')
        break
      case 'logout':
        signOut()
        router.push('/')
        break
      case 'toggle-theme':
        setTheme(theme === "dark" ? "light" : "dark")
        break
      case 'toggle-viewport':
        setMode(mode === "desktop" ? "mobile" : "desktop")
        break
    }
  }

  // 获取用户名：优先使用 name，其次使用邮箱前缀
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || t('common.user')

  return (
    <div className="relative">
      {/* 用户头像/登录按钮 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {session?.user ? (
          // 已登录：显示用户头像首字母
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-gradient-from to-brand-gradient-to flex items-center justify-center text-brand-foreground font-medium text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
        ) : (
          // 未登录：显示用户图标
          <User className="w-6 h-6 text-foreground" />
        )}
        {/* 下拉箭头 */}
        <ChevronDown className={`w-4 h-4 ml-1 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          {/* 点击遮罩关闭菜单 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* 菜单内容 */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-50 overflow-hidden">
            {/* 已登录用户信息头部 */}
            {session?.user ? (
              <div className="px-4 py-3 border-b border-border bg-muted">
                <p className="font-medium text-sm truncate text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
              </div>
            ) : null}

            <div className="py-1">
              {session?.user ? (
                <>
                  <button
                    onClick={() => handleMenuClick('profile')}
                    className={MENU_ITEM_CLASS}
                  >
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    {t('userMenu.profile')}
                  </button>
                  <button
                    onClick={() => handleMenuClick('orders')}
                    className={MENU_ITEM_CLASS}
                  >
                    <Package className="w-4 h-4 text-muted-foreground" />
                    {t('userMenu.orders')}
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleMenuClick('admin')}
                      className={MENU_ITEM_CLASS}
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      {t('userMenu.adminPanel')}
                    </button>
                  )}
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={() => handleMenuClick('toggle-theme')}
                    className={MENU_ITEM_CLASS}
                  >
                    {theme === "dark" ? (
                      <Sun className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Moon className="w-4 h-4 text-muted-foreground" />
                    )}
                    {theme === "dark" ? t('theme.lightMode') : t('theme.darkMode')}
                  </button>
                  <button
                    onClick={() => handleMenuClick('toggle-viewport')}
                    className={MENU_ITEM_CLASS}
                  >
                    {mode === "desktop" ? (
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Monitor className="w-4 h-4 text-muted-foreground" />
                    )}
                    {mode === "desktop" ? t('viewport.mobileView') : t('viewport.desktopView')}
                  </button>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={() => handleMenuClick('logout')}
                    className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-destructive transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('auth.logout')}
                  </button>
                </>
              ) : (
                <>
                  <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border">
                    {t('userMenu.tools')}
                  </div>
                  <button
                    onClick={() => handleMenuClick('toggle-theme')}
                    className={MENU_ITEM_CLASS}
                  >
                    {theme === "dark" ? (
                      <Sun className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Moon className="w-4 h-4 text-muted-foreground" />
                    )}
                    {theme === "dark" ? t('theme.lightMode') : t('theme.darkMode')}
                  </button>
                  <button
                    onClick={() => handleMenuClick('toggle-viewport')}
                    className={MENU_ITEM_CLASS}
                  >
                    {mode === "desktop" ? (
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Monitor className="w-4 h-4 text-muted-foreground" />
                    )}
                    {mode === "desktop" ? t('viewport.mobileView') : t('viewport.desktopView')}
                  </button>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={() => handleMenuClick('login')}
                    className={MENU_ITEM_CLASS}
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    {t('auth.login')}
                  </button>
                  <button
                    onClick={() => handleMenuClick('register')}
                    className={MENU_ITEM_CLASS}
                  >
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    {t('auth.register')}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* 认证弹窗 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </div>
  )
}
