/**
 * ============================================
 * 用户登录表单组件 (Phase 4 国际化升级)
 * ============================================
 * 2026-04-13: 更新为使用 next-intl 国际化
 * 功能说明：
 *   - 用户邮箱密码登录
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

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

/**
 * 登录表单组件
 *
 * 功能：
 *   - 邮箱密码输入框
 *   - 密码显示/隐藏切换
 *   - 表单验证和错误提示
 *   - 登录成功后调用 onSuccess 回调并刷新路由
 */
export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const t = useTranslations()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  /**
   * 处理表单提交
   * 调用 Better Auth 的 signIn.email 方法进行登录
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // 使用 Better Auth 进行邮箱密码登录
      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(t('auth.loginFailed'))
      } else {
        // 登录成功：执行回调并刷新页面
        onSuccess?.()
        router.refresh()
      }
    } catch {
      setError(t('auth.loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">{t('auth.email')}</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">{t('auth.password')}</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="pr-10"
          />
          {/* 密码显示/隐藏切换按钮 */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 错误提示 */}
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
          t('auth.login')
        )}
      </Button>

      {/* 切换到注册链接 */}
      <p className="text-center text-sm text-muted-foreground">
        {t('auth.noAccount')}{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-brand hover:underline"
        >
          {t('auth.register')}
        </button>
      </p>
    </form>
  )
}
