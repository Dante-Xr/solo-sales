"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { LoginForm } from "@/components/auth/LoginForm"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage() {
  const t = useTranslations("auth")
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("login")

  const handleSuccess = () => {
    router.replace("/")
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-10 sm:py-16">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("loginTitle")}</CardTitle>
            <CardDescription>{t("loginDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t("login")}</TabsTrigger>
                <TabsTrigger value="register">{t("register")}</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-6">
                <LoginForm
                  onSuccess={handleSuccess}
                  onSwitchToRegister={() => setActiveTab("register")}
                />
              </TabsContent>
              <TabsContent value="register" className="mt-6">
                <RegisterForm
                  onSuccess={handleSuccess}
                  onSwitchToLogin={() => setActiveTab("login")}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
