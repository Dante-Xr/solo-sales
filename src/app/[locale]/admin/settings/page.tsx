/**
 * ============================================
 * 系统设置页面 (Task 3.2)
 * ============================================
 * 功能说明：
 *   - 商店基本设置
 *   - 通知设置
 *   - API 配置
 * ============================================
 */

// 2026-04-13: 更新为使用 next-intl 国际化

"use client"

import { useState } from "react"
import { Settings, Bell, Key, Globe, Save, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations, useLocale } from "next-intl"
import { useRouter, usePathname } from "@/i18n/navigation"

export default function SettingsPage() {
  const t = useTranslations('admin')
  const commonT = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const isZh = locale === "zh"

  // 基本设置
  const [storeSettings, setStoreSettings] = useState({
    storeName: "SoloSales",
    storeEmail: "contact@solosales.com",
    storePhone: "+1 234 567 890",
    currency: "USD",
    timezone: "America/New_York",
  })

  // 通知设置
  const [notificationSettings, setNotificationSettings] = useState({
    emailOrderConfirm: true,
    emailOrderShipped: true,
    emailLowStock: true,
    emailNewCustomer: false,
    pushNewOrder: true,
    pushLowStock: true,
  })

  // API 设置
  const [apiSettings, setApiSettings] = useState({
    wholesaler1866Key: "",
    openaiKey: "",
    stripeKey: "",
  })

  // 保存状态
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // 保存设置
  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    // 模拟保存
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  // 切换语言
  const handleLanguageChange = (newLanguage: "zh" | "en") => {
    router.push(pathname, { locale: newLanguage })
  }

  return (
    <div className="min-h-screen bg-muted/50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">
              {t("settings")}
            </h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {t("saving")}
              </>
            ) : saved ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t("saved")}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t("saveSettings")}
              </>
            )}
          </Button>
        </div>

        {/* 设置选项卡 */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t("general")}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              {t("notifications")}
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              {t("apiConfig")}
            </TabsTrigger>
          </TabsList>

          {/* 基本设置 */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("storeInformation")}</CardTitle>
                <CardDescription>
                  {t("configureStoreBasicInfo")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">{t("storeName")}</Label>
                    <Input
                      id="storeName"
                      value={storeSettings.storeName}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({ ...prev, storeName: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeEmail">{t("contactEmail")}</Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      value={storeSettings.storeEmail}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({ ...prev, storeEmail: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storePhone">{t("phoneNumber")}</Label>
                    <Input
                      id="storePhone"
                      value={storeSettings.storePhone}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({ ...prev, storePhone: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">{t("currency")}</Label>
                    <select
                      id="currency"
                      value={storeSettings.currency}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({ ...prev, currency: e.target.value }))
                      }
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CNY">CNY - Chinese Yuan</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">{t("timezone")}</Label>
                  <select
                    id="timezone"
                    value={storeSettings.timezone}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({ ...prev, timezone: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Asia/Shanghai">Shanghai (CST)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("languageSettings")}</CardTitle>
                <CardDescription>
                  {t("selectStoreDefaultLanguage")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    variant={locale === "zh" ? "default" : "outline"}
                    onClick={() => handleLanguageChange("zh")}
                  >
                    中文
                  </Button>
                  <Button
                    variant={locale === "en" ? "default" : "outline"}
                    onClick={() => handleLanguageChange("en")}
                  >
                    English
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 通知设置 */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("emailNotifications")}</CardTitle>
                <CardDescription>
                  {t("configureEmailNotificationTriggers")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {t("orderConfirmationEmail")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("sendConfirmationWhenOrderIsPlaced")}
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.emailOrderConfirm}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        emailOrderConfirm: checked,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {t("shippingNotificationEmail")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("sendTrackingInfoWhenOrderShips")}
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.emailOrderShipped}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        emailOrderShipped: checked,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {t("lowStockAlert")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("alertWhenStockFallsBelowThreshold")}
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.emailLowStock}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        emailLowStock: checked,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {t("newCustomerRegistration")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("notifyWhenNewUserRegisters")}
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNewCustomer}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        emailNewCustomer: checked,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API 配置 */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("apiKeyConfiguration")}</CardTitle>
                <CardDescription>
                  {t("configureApiKeysForThirdPartyServices")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wholesaler1866Key">1866 {t("apiKey")}</Label>
                  <PasswordInput
                    id="wholesaler1866Key"
                    placeholder={t("enter1866ApiKey")}
                    value={apiSettings.wholesaler1866Key}
                    onChange={(e) =>
                      setApiSettings((prev) => ({ ...prev, wholesaler1866Key: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("usedForWholesaleProductImport")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openaiKey">OpenAI {t("apiKey")}</Label>
                  <PasswordInput
                    id="openaiKey"
                    placeholder={t("enterOpenaiApiKey")}
                    value={apiSettings.openaiKey}
                    onChange={(e) =>
                      setApiSettings((prev) => ({ ...prev, openaiKey: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("usedForAiCustomerService")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripeKey">Stripe {t("apiKey")}</Label>
                  <PasswordInput
                    id="stripeKey"
                    placeholder={t("enterStripeApiKey")}
                    value={apiSettings.stripeKey}
                    onChange={(e) =>
                      setApiSettings((prev) => ({ ...prev, stripeKey: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("usedForPaymentProcessing")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
