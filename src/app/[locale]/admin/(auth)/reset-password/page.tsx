"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "@/i18n/navigation"
import { RECOVERY_EMAIL_RESEND_COOLDOWN_SECONDS } from "@/lib/auth/recovery-policy"

export default function AdminPasswordResetPage() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [requested, setRequested] = useState(false)
  const [complete, setComplete] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [cliToken, setCliToken] = useState<string | null>(null)
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null)
  const [secondsUntilResend, setSecondsUntilResend] = useState(0)
  useEffect(() => { const token = new URLSearchParams(window.location.hash.slice(1)).get("token"); setCliToken(token) }, [])
  useEffect(() => {
    if (!resendAvailableAt) return

    const updateCountdown = () => {
      const seconds = Math.max(0, Math.ceil((resendAvailableAt - Date.now()) / 1000))
      setSecondsUntilResend(seconds)
      if (seconds === 0) setResendAvailableAt(null)
    }

    updateCountdown()
    const interval = window.setInterval(updateCountdown, 1_000)
    return () => window.clearInterval(interval)
  }, [resendAvailableAt])

  async function requestCode(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/admin/auth/password-reset/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) })
      if (!response.ok) {
        const result = await response.json() as { message?: unknown }
        setError(typeof result.message === "string" ? result.message : "发送验证码失败，请稍后重试")
        return
      }
      setRequested(true)
      setResendAvailableAt(Date.now() + RECOVERY_EMAIL_RESEND_COOLDOWN_SECONDS * 1_000)
    } finally {
      setLoading(false)
    }
  }
  async function reset(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError("")
    try {
      const response = await fetch(cliToken ? "/api/admin/auth/password-reset/cli-confirm" : "/api/admin/auth/password-reset/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cliToken ? { token: cliToken, password } : { email, otp, password }) })
      if (!response.ok) { setError("验证码无效或已过期"); return }
      setComplete(true)
    } catch { setError("验证码无效或已过期") } finally { setLoading(false) }
  }

  const canReset = Boolean(cliToken || requested)

  return <div className="min-h-screen bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center p-4"><div className="w-full max-w-md space-y-8"><div className="text-center"><h1 className="text-3xl font-bold text-foreground">SoloSales</h1><p className="mt-2 text-muted-foreground">管理后台密码重置</p></div><Card className="shadow-lg"><CardHeader><CardTitle className="text-center text-xl">重置管理员密码</CardTitle></CardHeader><CardContent>{complete ? <div className="space-y-4 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" /><p>密码已重置，请重新登录。</p></div> : <form onSubmit={reset} className="space-y-4"><div className="space-y-2"><Label htmlFor="admin-email">管理员邮箱</Label><Input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={loading || canReset} /></div>{!cliToken && <Button type="button" variant="outline" className="w-full" onClick={requestCode} disabled={loading || !email || secondsUntilResend > 0}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{secondsUntilResend > 0 ? `${secondsUntilResend} 秒后可重新发送` : requested ? "重新发送验证码" : "发送验证码"}</Button>}<div className="space-y-2"><Label htmlFor="admin-otp">邮箱验证码</Label><Input id="admin-otp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} required disabled={!canReset || loading} /></div><div className="space-y-2"><Label htmlFor="admin-password">新密码</Label><Input id="admin-password" type="password" minLength={8} maxLength={50} value={password} onChange={(event) => setPassword(event.target.value)} required disabled={!canReset || loading} /></div><p className="text-xs text-muted-foreground">至少 8 位，包含大小写字母、数字和符号。</p>{!canReset && <p className="text-sm text-muted-foreground">请先向管理员邮箱发送验证码。</p>}{error && <p className="text-sm text-destructive">{error}</p>}<Button type="submit" className="w-full" disabled={loading || !canReset}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}重置密码</Button></form>}</CardContent></Card><Link href="/admin/login" className="block text-center text-sm text-brand hover:underline">返回管理员登录</Link></div></div>
}
