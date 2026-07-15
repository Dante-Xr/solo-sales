/**
 * 修改时间：2026-05-02 21:19:13 +08:00
 * 修改内容：用 AdminProfile 类型替代个人资料页 profile any。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 管理员个人资料页面 (Phase 5 管理后台重构)
 * ============================================
 * 功能说明：
 *   - 显示和编辑管理员个人资料
 *   - 修改用户名
 *   - 修改密码
 *   - 使用 Refine useOne hook 获取个人资料
 * ============================================
 * 2026-04-13: 集成 Refine useOne hook
 * 2026-04-13 23:45: 迁移到 Refine 数据获取方案
 */

"use client"

import { useState, useMemo, useEffect } from "react"
import { useOne } from "@refinedev/core"
import { User, Key, Save, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useTranslations, useLocale } from "next-intl"
import { toast } from "sonner"

interface AdminProfile {
  username: string
  email: string
  role?: {
    label: string
  }
  lastLoginAt: string | null
}

export default function AdminProfilePage() {
  const t = useTranslations('admin.profile')
  const locale = useLocale()

  const { query: { data: profileData, isLoading: loading, refetch, error: queryError } } = useOne({
    resource: "profile",
    id: "me",
    queryOptions: { enabled: true },
  })

  const profile = useMemo<AdminProfile | null>(() => {
    const raw = profileData?.data as AdminProfile | undefined
    return raw || null
  }, [profileData])

  const [username, setUsername] = useState("")
  const [usernameSaving, setUsernameSaving] = useState(false)
  const [usernameSuccess, setUsernameSuccess] = useState(false)

  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.username) setUsername(profile.username)
  }, [profile])

  const handleUsernameSave = async () => {
    if (!username.trim() || username === profile?.username) return
    setUsernameSaving(true)
    setUsernameSuccess(false)
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      })
      const result = await response.json()
      if (result.success) {
        refetch()
        setUsernameSuccess(true)
        setTimeout(() => setUsernameSuccess(false), 3000)
      } else {
        toast.error(result.error || t('updateFailed'))
      }
    } catch (err) {
      console.error("更新用户名失败:", err)
      toast.error(t('networkError'))
    } finally {
      setUsernameSaving(false)
    }
  }

  const handlePasswordSave = async () => {
    setPasswordError(null)
    if (!passwordData.oldPassword) { setPasswordError(t('pleaseEnterOldPassword')); return }
    if (!passwordData.newPassword) { setPasswordError(t('pleaseEnterNewPassword')); return }
    if (passwordData.newPassword.length < 6) { setPasswordError(t('newPasswordMustBeAtLeast6Characters')); return }
    if (passwordData.newPassword !== passwordData.confirmPassword) { setPasswordError(t('newPasswordsDoNotMatch')); return }

    setPasswordSaving(true)
    setPasswordSuccess(false)
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword }),
      })
      const result = await response.json()
      if (result.success) {
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" })
        setPasswordSuccess(true)
        setTimeout(() => setPasswordSuccess(false), 3000)
      } else {
        setPasswordError(result.error || t('failedToChangePassword'))
      }
    } catch (err) {
      console.error("修改密码失败:", err)
      setPasswordError(t('networkError'))
    } finally {
      setPasswordSaving(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">{t('loading')}</span>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (queryError && !profile) {
    return (
      <div className="min-h-screen bg-muted/50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-destructive">{t('failedToLoadProfile')}</p>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('retry')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <User className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">{t('profile')}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('basicInformation')}</CardTitle>
            <CardDescription>{t('manageBasicInfo')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('username')}</Label>
              <div className="flex gap-2">
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('enterUsername')} />
                <Button onClick={handleUsernameSave} disabled={usernameSaving || username === profile?.username || !username.trim()}>
                  {usernameSaving ? (<><RefreshCw className="w-4 h-4 mr-2 animate-spin" />{t('saving')}</>)
                   : usernameSuccess ? (<><CheckCircle className="w-4 h-4 mr-2" />{t('saved')}</>)
                   : (<><Save className="w-4 h-4 mr-2" />{t('save')}</>)}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" value={profile?.email || ""} disabled readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t('role')}</Label>
              <Input id="role" value={profile?.role?.label || ""} disabled readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastLogin">{t('lastLogin')}</Label>
              <Input id="lastLogin" value={formatDate(profile?.lastLoginAt || null)} disabled readOnly className="bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              {t('changePassword')}
            </CardTitle>
            <CardDescription>{t('changePasswordDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">{t('oldPassword')}</Label>
              <PasswordInput id="oldPassword" value={passwordData.oldPassword} onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} placeholder={t('enterOldPassword')} />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('newPassword')}</Label>
              <PasswordInput id="newPassword" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} placeholder={t('enterNewPassword')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <PasswordInput id="confirmPassword" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} placeholder={t('enterNewPasswordAgain')} />
            </div>
            {passwordError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle className="w-4 h-4" />
                {t('passwordChangedSuccessfully')}
              </div>
            )}
            <Button onClick={handlePasswordSave} disabled={passwordSaving || !passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword} className="w-full">
              {passwordSaving ? (<><RefreshCw className="w-4 h-4 mr-2 animate-spin" />{t('saving')}</>)
               : (<><Save className="w-4 h-4 mr-2" />{t('changePassword')}</>)}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
