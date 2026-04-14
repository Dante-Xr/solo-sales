"use client"

import { signOut, useSession } from "@/lib/auth-client"
import { useState } from "react"
import { useRouter, Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ShoppingBag, User, Settings, LogOut, ArrowLeft, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { ViewportWrapper } from "@/components/storefront/ViewportWrapper"
import { LanguageSwitcher } from "@/components/storefront/LanguageSwitcher"
import { ViewportModeToggle } from "@/components/storefront/ViewportModeToggle"

export default function ProfilePage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const t = useTranslations()
  const { theme, setTheme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    )
  }

  if (!session) {
    router.push("/")
    return null
  }

  if (!formData.name && session?.user) {
    setFormData({
      name: session.user.name || "",
      email: session.user.email || "",
    })
  }

  const handleSave = async () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setIsEditing(false)
    }, 500)
  }

  return (
    <ViewportWrapper>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[1440px] mx-auto relative">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="px-3">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 hover:bg-accent active:bg-accent/80 transition-colors"
                  onClick={() => router.push('/')}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">S</span>
                  </div>
                  <span className="text-base font-bold text-foreground">Solo Sales</span>
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
                <Button variant="ghost" size="icon" className="relative w-9 h-9" onClick={() => router.push("/cart")}>
                  <ShoppingBag className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="p-3">
          <h1 className="text-lg font-bold mb-4">{t('profile.title')}</h1>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold mb-3">
                  {(session?.user?.name || session?.user?.email || "U").charAt(0).toUpperCase()}
                </div>
                <p className="font-medium text-sm">{session?.user?.name || session?.user?.email}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.role || "user"}</p>

                <div className="w-full mt-4 space-y-1">
                  <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => router.push("/orders")}>
                    <User className="w-4 h-4 mr-2" />
                    {t('orders.title')}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    <Settings className="w-4 h-4 mr-2" />
                    {t('profile.security')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 text-sm"
                    onClick={() => {
                      if (confirm(t('profile.logoutConfirm'))) {
                        signOut()
                        router.push("/")
                      }
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('auth.logout')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    {t('profile.accountInfo')}
                  </CardTitle>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="text-xs">
                      {t('common.edit')}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setIsEditing(false)
                        setFormData({
                          name: session?.user?.name || "",
                          email: session?.user?.email || "",
                        })
                      }} className="text-xs">
                        {t('common.cancel')}
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={loading} className="text-xs">
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : t('common.save')}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="profile-name" className="text-xs">{t('auth.name')}</Label>
                  <Input
                    id="profile-name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="profile-email" className="text-xs">{t('auth.email')}</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {t('profile.security')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full justify-start text-sm">
                  {t('profile.changePassword')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
    </ViewportWrapper>
  )
}
