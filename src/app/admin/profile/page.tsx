/**
 * ============================================
 * 管理员个人资料页面
 * ============================================
 * 功能说明：
 *   - 显示和编辑管理员个人资料
 *   - 修改用户名
 *   - 修改密码
 * ============================================
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { User, Key, Save, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/context/LanguageContext"

interface AdminProfile {
  id: string
  username: string
  email: string
  role: {
    id: string
    name: string
    label: string
  }
  lastLoginAt: string | null
  createdAt: string
}

export default function AdminProfilePage() {
  const { language } = useLanguage()
  const isZh = language === "zh"

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<AdminProfile | null>(null)

  const [username, setUsername] = useState("")
  const [usernameSaving, setUsernameSaving] = useState(false)
  const [usernameSuccess, setUsernameSuccess] = useState(false)

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/profile")
      const result = await response.json()

      if (result.success) {
        setProfile(result.data)
        setUsername(result.data.username)
      } else {
        setError(result.error || (isZh ? "获取资料失败" : "Failed to load profile"))
      }
    } catch (err) {
      console.error("获取管理员资料失败:", err)
      setError(isZh ? "网络错误，请稍后重试" : "Network error, please try again later")
    } finally {
      setLoading(false)
    }
  }, [isZh])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleUsernameSave = async () => {
    if (!username.trim() || username === profile?.username) {
      return
    }

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
        setProfile((prev) => (prev ? { ...prev, username } : null))
        setUsernameSuccess(true)
        setTimeout(() => setUsernameSuccess(false), 3000)
      } else {
        alert(result.error || (isZh ? "更新失败" : "Update failed"))
      }
    } catch (err) {
      console.error("更新用户名失败:", err)
      alert(isZh ? "网络错误，请稍后重试" : "Network error, please try again later")
    } finally {
      setUsernameSaving(false)
    }
  }

  const handlePasswordSave = async () => {
    setPasswordError(null)

    if (!passwordData.oldPassword) {
      setPasswordError(isZh ? "请输入旧密码" : "Please enter old password")
      return
    }

    if (!passwordData.newPassword) {
      setPasswordError(isZh ? "请输入新密码" : "Please enter new password")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError(isZh ? "新密码长度至少为6位" : "New password must be at least 6 characters")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(isZh ? "两次输入的新密码不一致" : "New passwords do not match")
      return
    }

    setPasswordSaving(true)
    setPasswordSuccess(false)
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      })
      const result = await response.json()

      if (result.success) {
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" })
        setPasswordSuccess(true)
        setTimeout(() => setPasswordSuccess(false), 3000)
      } else {
        setPasswordError(result.error || (isZh ? "密码修改失败" : "Failed to change password"))
      }
    } catch (err) {
      console.error("修改密码失败:", err)
      setPasswordError(isZh ? "网络错误，请稍后重试" : "Network error, please try again later")
    } finally {
      setPasswordSaving(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleString(isZh ? "zh-CN" : "en-US")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                {isZh ? "加载中..." : "Loading..."}
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchProfile}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {isZh ? "重试" : "Retry"}
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
          <h1 className="text-2xl font-bold">
            {isZh ? "个人资料" : "Profile"}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isZh ? "基本信息" : "Basic Information"}</CardTitle>
            <CardDescription>
              {isZh ? "管理您的账户基本信息" : "Manage your account basic information"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{isZh ? "用户名" : "Username"}</Label>
              <div className="flex gap-2">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isZh ? "输入用户名" : "Enter username"}
                />
                <Button
                  onClick={handleUsernameSave}
                  disabled={usernameSaving || username === profile?.username || !username.trim()}
                >
                  {usernameSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      {isZh ? "保存中..." : "Saving..."}
                    </>
                  ) : usernameSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isZh ? "已保存!" : "Saved!"}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isZh ? "保存" : "Save"}
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{isZh ? "邮箱" : "Email"}</Label>
              <Input
                id="email"
                value={profile?.email || ""}
                disabled
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">{isZh ? "角色" : "Role"}</Label>
              <Input
                id="role"
                value={profile?.role?.label || ""}
                disabled
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastLogin">{isZh ? "最后登录时间" : "Last Login"}</Label>
              <Input
                id="lastLogin"
                value={formatDate(profile?.lastLoginAt || null)}
                disabled
                readOnly
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              {isZh ? "修改密码" : "Change Password"}
            </CardTitle>
            <CardDescription>
              {isZh ? "修改您的账户密码" : "Change your account password"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">{isZh ? "旧密码" : "Old Password"}</Label>
              <PasswordInput
                id="oldPassword"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                placeholder={isZh ? "输入旧密码" : "Enter old password"}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="newPassword">{isZh ? "新密码" : "New Password"}</Label>
              <PasswordInput
                id="newPassword"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder={isZh ? "输入新密码" : "Enter new password"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{isZh ? "确认密码" : "Confirm Password"}</Label>
              <PasswordInput
                id="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder={isZh ? "再次输入新密码" : "Enter new password again"}
              />
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                {isZh ? "密码修改成功!" : "Password changed successfully!"}
              </div>
            )}

            <Button
              onClick={handlePasswordSave}
              disabled={passwordSaving || !passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              className="w-full"
            >
              {passwordSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {isZh ? "保存中..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isZh ? "修改密码" : "Change Password"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}