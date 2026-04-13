"use client"

import { signOut } from "next-auth/react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ShoppingBag, User, Settings, LogOut } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { useTheme } from "next-themes"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, language } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  const isZh = language === "zh"

  const navItems = [
    { labelKey: "nav.home", href: "/" },
    { labelKey: "nav.shop", href: "/products" },
    { labelKey: "nav.about", href: "/about" },
    { labelKey: "nav.contact", href: "/contact" },
  ]

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    )
  }

  if (status === "unauthenticated") {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[1440px] mx-auto relative">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
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

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? "☀️" : "🌙"}
                </Button>
                <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/cart")}>
                  <ShoppingBag className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <h1 className="text-2xl lg:text-3xl font-bold mb-6">{t("profile.title")}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold mb-4">
                    {(session?.user?.name || session?.user?.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <p className="font-medium text-lg">{session?.user?.name || session?.user?.email}</p>
                  <p className="text-sm text-muted-foreground">{(session?.user as { role?: string })?.role || "USER"}</p>

                  <div className="w-full mt-6 space-y-2">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/orders")}>
                      <User className="w-4 h-4 mr-2" />
                      {t("orders.title")}
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      {t("profile.security")}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm(t("profile.logoutConfirm"))) {
                          signOut({ callbackUrl: "/" })
                        }
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("auth.logout")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {t("profile.accountInfo")}
                    </CardTitle>
                    {!isEditing ? (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        {t("common.edit")}
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setIsEditing(false)
                          setFormData({
                            name: session?.user?.name || "",
                            email: session?.user?.email || "",
                          })
                        }}>
                          {t("common.cancel")}
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={loading}>
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("common.save")}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">{t("auth.name")}</Label>
                    <Input
                      id="profile-name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-email">{t("auth.email")}</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {t("profile.security")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    {t("profile.changePassword")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
