"use client"

import { signOut } from "next-auth/react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Loader2 } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <main className="w-full max-w-md bg-white min-h-screen shadow-xl flex flex-col">
        <header className="flex items-center p-4 border-b sticky top-0 bg-white z-50">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-bold ml-2">{t("profile.title")}</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold mb-4">
                {(session?.user?.name || session?.user?.email || "U").charAt(0).toUpperCase()}
              </div>
              <p className="font-medium text-lg">{session?.user?.name || session?.user?.email}</p>
              <p className="text-sm text-gray-500">{(session?.user as { role?: string })?.role || "USER"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {t("profile.accountInfo")}
                </CardTitle>
                {!isEditing ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    {t("common.edit")}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false)
                        setFormData({
                          name: session?.user?.name || "",
                          email: session?.user?.email || "",
                        })
                      }}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : t("common.save")}
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {t("profile.security")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  alert(t("profile.comingSoon"))
                }}
              >
                {t("profile.changePassword")}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  if (confirm(t("profile.logoutConfirm"))) {
                    signOut({ callbackUrl: "/" })
                  }
                }}
              >
                {t("auth.logout")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
