/**
 * ============================================
 * 管理员登录页面
 * ============================================
 * 功能说明：
 *   - 管理员身份验证
 *   - 记住登录
 *   - 错误提示
 * ============================================
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Lock, Mail, AlertCircle } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

export default function AdminLoginPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const isZh = language === "zh"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      })

      const result = await response.json()

      if (result.success) {
        router.push("/admin")
      } else {
        setError(result.error || (isZh ? "登录失败" : "Login failed"))
      }
    } catch {
      setError(isZh ? "网络错误，请稍后重试" : "Network error, please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">SoloSales</h1>
          <p className="text-muted-foreground mt-2">
            {isZh ? "后台管理系统" : "Admin Dashboard"}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">
              {isZh ? "管理员登录" : "Admin Login"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">
                  {isZh ? "管理员邮箱" : "Admin Email"}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@solosales.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {isZh ? "密码" : "Password"}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-input w-4 h-4"
                />
                <Label htmlFor="remember" className="ml-2 text-sm cursor-pointer">
                  {isZh ? "记住登录 (7天)" : "Remember login (7 days)"}
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isZh ? "登录中..." : "Logging in..."}
                  </>
                ) : (
                  <>{isZh ? "登 录" : "Login"}</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isZh ? "默认账号: admin@solosales.com / Admin@123456" : "Default: admin@solosales.com / Admin@123456"}
        </p>
      </div>
    </div>
  )
}
