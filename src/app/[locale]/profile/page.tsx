"use client"

import { signOut, useSession } from "@/lib/auth-client"
import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, User, Settings, LogOut, Package, Heart, MapPin, Ticket, Clock, HelpCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { StorefrontPageLayout } from "@/components/storefront/StorefrontPageLayout"

export default function ProfilePage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const t = useTranslations()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  // 加载中状态
  if (isPending) {
    return (
      <StorefrontPageLayout title={t('profile.title')} showBack>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      </StorefrontPageLayout>
    )
  }

  // 未登录跳转首页
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

  /** 退出登录 */
  const handleLogout = () => {
    if (confirm(t('profile.logoutConfirm'))) {
      signOut()
      router.push("/")
    }
  }

  /** 用户头像首字母 */
  const userInitial = (session?.user?.name || session?.user?.email || "U").charAt(0).toUpperCase()

  /** 用户显示名称 */
  const userName = session?.user?.name || session?.user?.email

  /** 用户角色 */
  const userRole = session?.user?.role || "user"

  /** 宫格快捷入口配置 */
  const quickEntries = [
    { icon: Package, label: t('orders.title'), href: "/orders" },
    { icon: Heart, label: t('profile.wishlist') || "收藏", href: "/wishlist" },
    { icon: MapPin, label: t('profile.address') || "地址", href: "/address" },
    { icon: Ticket, label: t('profile.coupon') || "优惠券", href: "/coupon" },
    { icon: Clock, label: t('profile.history') || "历史", href: "/history" },
    { icon: HelpCircle, label: t('profile.help') || "帮助", href: "/help" },
  ]

  return (
    <StorefrontPageLayout title={t('profile.title')} showBack>
      {/* 移动端布局：保持原有卡片式排列 */}
      <div className="md:hidden p-3 space-y-4">
        <Card>
          <CardContent className="pt-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-gradient-from to-brand-gradient-to flex items-center justify-center text-brand-foreground text-xl font-bold mb-3">
              {userInitial}
            </div>
            <p className="font-medium text-sm">{userName}</p>
            <p className="text-xs text-muted-foreground">{userRole}</p>

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
                className="w-full justify-start text-brand hover:text-brand/80 hover:bg-red-50 text-sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('auth.logout')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 移动端宫格快捷入口 */}
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-4 gap-3">
              {quickEntries.map((entry) => (
                <button
                  key={entry.href}
                  onClick={() => router.push(entry.href)}
                  className="flex flex-col items-center gap-1.5 py-2"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <entry.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="text-[11px] text-muted-foreground">{entry.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('profile.accountInfo')}</CardTitle>
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
            <CardTitle className="text-sm">{t('profile.security')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full justify-start text-sm">
              {t('profile.changePassword')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* PC端布局：左侧导航 + 右侧内容 */}
      <div className="hidden md:flex md:gap-6 p-3 md:p-4">
        <aside className="md:w-1/4">
          <div className="sticky top-16 space-y-4">
            {/* 用户信息卡 */}
            <Card>
              <CardContent className="pt-4 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-gradient-from to-brand-gradient-to flex items-center justify-center text-brand-foreground text-xl font-bold mb-3">
                  {userInitial}
                </div>
                <p className="font-medium text-sm">{userName}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </CardContent>
            </Card>

            {/* 侧边导航菜单 */}
            <Card>
              <CardContent className="pt-3 space-y-1">
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
                  className="w-full justify-start text-brand hover:text-brand/80 hover:bg-red-50 text-sm"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('auth.logout')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </aside>

        <div className="md:w-3/4 space-y-4">
          {/* 账户信息 */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{t('profile.accountInfo')}</CardTitle>
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

          {/* 安全设置 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('profile.security')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full justify-start text-sm">
                {t('profile.changePassword')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </StorefrontPageLayout>
  )
}
