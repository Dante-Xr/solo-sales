/**
 * ============================================
 * 用户注册表单组件 (Phase 4 国际化升级)
 * ============================================
 * 2026-04-13: 更新为使用 next-intl 国际化
 * 功能说明：
 *   - 用户邮箱密码注册
 *   - 注册成功后自动登录
 *   - 使用 Better Auth 替代 NextAuth
 *   - 使用 next-intl 进行国际化
 * ============================================
 */

"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

/**
 * 注册表单组件
 *
 * 功能：
 *   - 用户名、邮箱、密码、确认密码输入
 *   - 密码一致性验证
 *   - 密码长度验证（至少 6 位）
 *   - 注册成功后自动登录
 */
export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const t = useTranslations()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  /**
   * 处理表单提交
   *
   * 流程：
   *   1. 验证密码一致性
   *   2. 验证密码长度（至少 6 位）
   *   3. 调用 Better Auth signUp.email 注册
   *   4. 注册成功后自动调用 signIn.email 登录
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // 验证密码一致性
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'))
      return
    }

    // 验证密码长度
    if (password.length < 6) {
      setError(t('auth.passwordRequired'))
      return
    }

    setLoading(true)

    try {
      // 使用 Better Auth 进行用户注册
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message || t('auth.registerFailed'))
        return
      }

      // 注册成功后自动登录
      const signInResult = await authClient.signIn.email({
        email,
        password,
      })

      if (signInResult.error) {
        setError(t('auth.registerFailed'))
      } else {
        onSuccess?.()
        router.refresh()
      }
    } catch {
      setError(t('auth.registerFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-name">{t('auth.name')}</Label>
        <Input
          id="register-name"
          type="text"
          placeholder={t('auth.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">{t('auth.email')}</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">{t('auth.password')}</Label>
        <div className="relative">
          <Input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.passwordRequired')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-confirm">{t('auth.confirmPassword')}</Label>
        <Input
          id="register-confirm"
          type={showPassword ? 'text' : 'password'}
          placeholder={t('auth.confirmPassword')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t('common.loading')}
          </>
        ) : (
          t('auth.register')
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t('auth.hasAccount')}{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-brand hover:underline"
        >
          {t('auth.login')}
        </button>
      </p>
    </form>
  )
}
