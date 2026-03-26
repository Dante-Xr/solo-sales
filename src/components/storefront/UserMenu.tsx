"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { User, ChevronDown, UserCircle, Package, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/context/LanguageContext"
import { AuthModal } from "@/components/auth/AuthModal"

export function UserMenu() {
  const { data: session } = useSession()
  const router = useRouter()
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN"

  const handleMenuClick = (action: string) => {
    setIsOpen(false)
    switch (action) {
      case "login":
        setAuthMode("login")
        setShowAuthModal(true)
        break
      case "register":
        setAuthMode("register")
        setShowAuthModal(true)
        break
      case "profile":
        router.push("/profile")
        break
      case "orders":
        router.push("/orders")
        break
      case "admin":
        router.push("/admin")
        break
      case "logout":
        signOut({ callbackUrl: "/" })
        break
    }
  }

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || t("common.user")

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {session?.user ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-medium text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
        ) : (
          <User className="w-6 h-6 text-foreground" />
        )}
        <ChevronDown className={`w-4 h-4 ml-1 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-50 overflow-hidden">
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
                    onClick={() => handleMenuClick("profile")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-3 text-foreground"
                  >
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    {t("userMenu.profile")}
                  </button>
                  <button
                    onClick={() => handleMenuClick("orders")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-3 text-foreground"
                  >
                    <Package className="w-4 h-4 text-muted-foreground" />
                    {t("userMenu.orders")}
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleMenuClick("admin")}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-3 text-foreground"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      {t("userMenu.adminPanel")}
                    </button>
                  )}
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={() => handleMenuClick("logout")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-3 text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("auth.logout")}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleMenuClick("login")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-3 text-foreground"
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    {t("auth.login")}
                  </button>
                  <button
                    onClick={() => handleMenuClick("register")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-3 text-foreground"
                  >
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    {t("auth.register")}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </div>
  )
}
