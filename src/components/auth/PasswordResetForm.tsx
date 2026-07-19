"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RECOVERY_EMAIL_RESEND_COOLDOWN_SECONDS } from "@/lib/auth/recovery-policy"

export function PasswordResetForm() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [requested, setRequested] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [complete, setComplete] = useState(false)
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null)
  const [secondsUntilResend, setSecondsUntilResend] = useState(0)

  useEffect(() => {
    if (!resendAvailableAt) return

    const updateCountdown = () => {
      const seconds = Math.max(0, Math.ceil((resendAvailableAt - Date.now()) / 1_000))
      setSecondsUntilResend(seconds)
      if (seconds === 0) setResendAvailableAt(null)
    }

    updateCountdown()
    const interval = window.setInterval(updateCountdown, 1_000)
    return () => window.clearInterval(interval)
  }, [resendAvailableAt])

  async function requestCode() {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) {
        setError("发送验证码失败，请稍后重试")
        return
      }
      setRequested(true)
      setResendAvailableAt(Date.now() + RECOVERY_EMAIL_RESEND_COOLDOWN_SECONDS * 1_000)
    } catch {
      setError("发送验证码失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      })
      if (!response.ok) {
        setError("验证码无效或已过期")
        return
      }
      setComplete(true)
    } catch {
      setError("验证码无效或已过期")
    } finally {
      setLoading(false)
    }
  }

  if (complete) {
    return <div className="space-y-4 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" /><p>密码已重置，请使用新密码登录。</p></div>
  }

  return <form onSubmit={resetPassword} className="space-y-4">
    <div className="space-y-2"><Label htmlFor="reset-email">邮箱</Label><Input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={loading || requested} /></div>
    <Button type="button" variant="outline" className="w-full" onClick={requestCode} disabled={loading || !email || secondsUntilResend > 0}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {secondsUntilResend > 0 ? `${secondsUntilResend} 秒后可重新发送` : requested ? "重新发送验证码" : "发送验证码"}
    </Button>
    <div className="space-y-2"><Label htmlFor="reset-otp">邮箱验证码</Label><Input id="reset-otp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} required disabled={!requested || loading} /></div>
    <div className="space-y-2"><Label htmlFor="reset-password">新密码</Label><Input id="reset-password" type="password" minLength={8} maxLength={50} value={password} onChange={(event) => setPassword(event.target.value)} required disabled={!requested || loading} /></div>
    <p className="text-xs text-muted-foreground">至少 8 位，包含大小写字母、数字和符号。</p>
    {!requested && <p className="text-sm text-muted-foreground">请先向邮箱发送验证码。</p>}
    {error && <p className="text-sm text-destructive">{error}</p>}
    <Button type="submit" className="w-full" disabled={loading || !requested}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}重置密码</Button>
  </form>
}
