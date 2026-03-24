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

"use client"

import { useState } from "react"
import { Settings, Bell, Key, Globe, Save, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/context/LanguageContext"

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage()
  const isZh = language === "zh"

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

  return (
    <div className="min-h-screen bg-muted/50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">
              {isZh ? "系统设置" : "Settings"}
            </h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {isZh ? "保存中..." : "Saving..."}
              </>
            ) : saved ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isZh ? "已保存!" : "Saved!"}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isZh ? "保存设置" : "Save Settings"}
              </>
            )}
          </Button>
        </div>

        {/* 设置选项卡 */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {isZh ? "基本设置" : "General"}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              {isZh ? "通知" : "Notifications"}
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              {isZh ? "API 配置" : "API Config"}
            </TabsTrigger>
          </TabsList>

          {/* 基本设置 */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isZh ? "商店信息" : "Store Information"}</CardTitle>
                <CardDescription>
                  {isZh ? "设置商店的基本信息" : "Configure your store basic information"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">{isZh ? "商店名称" : "Store Name"}</Label>
                    <Input
                      id="storeName"
                      value={storeSettings.storeName}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({ ...prev, storeName: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeEmail">{isZh ? "联系邮箱" : "Contact Email"}</Label>
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
                    <Label htmlFor="storePhone">{isZh ? "联系电话" : "Phone Number"}</Label>
                    <Input
                      id="storePhone"
                      value={storeSettings.storePhone}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({ ...prev, storePhone: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">{isZh ? "货币" : "Currency"}</Label>
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
                  <Label htmlFor="timezone">{isZh ? "时区" : "Timezone"}</Label>
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
                <CardTitle>{isZh ? "语言设置" : "Language Settings"}</CardTitle>
                <CardDescription>
                  {isZh ? "选择商店默认语言" : "Select store default language"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    variant={language === "zh" ? "default" : "outline"}
                    onClick={() => setLanguage("zh")}
                  >
                    中文
                  </Button>
                  <Button
                    variant={language === "en" ? "default" : "outline"}
                    onClick={() => setLanguage("en")}
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
                <CardTitle>{isZh ? "邮件通知" : "Email Notifications"}</CardTitle>
                <CardDescription>
                  {isZh ? "配置邮件通知的发送条件" : "Configure email notification triggers"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {isZh ? "订单确认邮件" : "Order Confirmation Email"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isZh ? "客户下单后发送确认邮件" : "Send confirmation when order is placed"}
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
                      {isZh ? "发货通知邮件" : "Shipping Notification Email"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isZh ? "订单发货后发送物流信息" : "Send tracking info when order ships"}
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
                      {isZh ? "低库存提醒" : "Low Stock Alert"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isZh ? "商品库存低于阈值时发送提醒" : "Alert when stock falls below threshold"}
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
                      {isZh ? "新客户注册通知" : "New Customer Registration"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isZh ? "新用户注册时发送通知" : "Notify when new user registers"}
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
                <CardTitle>{isZh ? "API 密钥配置" : "API Key Configuration"}</CardTitle>
                <CardDescription>
                  {isZh ? "配置第三方服务的 API 密钥" : "Configure API keys for third-party services"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wholesaler1866Key">1866 {isZh ? "API 密钥" : "API Key"}</Label>
                  <Input
                    id="wholesaler1866Key"
                    type="password"
                    placeholder={isZh ? "输入 1866 API 密钥" : "Enter 1866 API Key"}
                    value={apiSettings.wholesaler1866Key}
                    onChange={(e) =>
                      setApiSettings((prev) => ({ ...prev, wholesaler1866Key: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {isZh ? "用于批发商品导入功能" : "Used for wholesale product import"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openaiKey">OpenAI {isZh ? "API 密钥" : "API Key"}</Label>
                  <Input
                    id="openaiKey"
                    type="password"
                    placeholder={isZh ? "输入 OpenAI API 密钥" : "Enter OpenAI API Key"}
                    value={apiSettings.openaiKey}
                    onChange={(e) =>
                      setApiSettings((prev) => ({ ...prev, openaiKey: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {isZh ? "用于智能客服和 AI 功能" : "Used for AI customer service and features"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripeKey">Stripe {isZh ? "API 密钥" : "API Key"}</Label>
                  <Input
                    id="stripeKey"
                    type="password"
                    placeholder={isZh ? "输入 Stripe API 密钥" : "Enter Stripe API Key"}
                    value={apiSettings.stripeKey}
                    onChange={(e) =>
                      setApiSettings((prev) => ({ ...prev, stripeKey: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {isZh ? "用于支付处理" : "Used for payment processing"}
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