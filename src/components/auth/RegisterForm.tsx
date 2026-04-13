/**
 * ============================================
 * 用户注册表单组件 (Phase 2 安全修复)
 * ============================================
 * 功能说明：
 *   - 用户邮箱密码注册
 *   - 注册成功后自动登录
 *   - 使用 Better Auth 替代 NextAuth
 * ============================================
 */

"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

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
  const { language } = useLanguage()
  const isZh = language === "zh"
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
      setError(isZh ? "两次输入的密码不一致" : "Passwords do not match")
      return
    }

    // 验证密码长度
    if (password.length < 6) {
      setError(isZh ? "密码至少需要6个字符" : "Password must be at least 6 characters")
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
        setError(result.error.message || (isZh ? "注册失败" : "Registration failed"))
        return
      }

      // 注册成功后自动登录
      const signInResult = await authClient.signIn.email({
        email,
        password,
      })

      if (signInResult.error) {
        setError(isZh ? "注册成功但登录失败，请手动登录" : "Registration successful but login failed, please login manually")
      } else {
        onSuccess?.()
        router.refresh()
      }
    } catch {
      setError(isZh ? "注册失败，请稍后重试" : "Registration failed, please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-name">{isZh ? "用户名" : "Name"}</Label>
        <Input
          id="register-name"
          type="text"
          placeholder={isZh ? "您的用户名" : "Your name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">{isZh ? "邮箱" : "Email"}</Label>
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
        <Label htmlFor="register-password">{isZh ? "密码" : "Password"}</Label>
        <div className="relative">
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder={isZh ? "至少6个字符" : "At least 6 characters"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-confirm">{isZh ? "确认密码" : "Confirm Password"}</Label>
        <Input
          id="register-confirm"
          type={showPassword ? "text" : "password"}
          placeholder={isZh ? "再次输入密码" : "Enter password again"}
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
            {isZh ? "注册中..." : "Registering..."}
          </>
        ) : (
          isZh ? "注册" : "Register"
        )}
      </Button>

      <p className="text-center text-sm text-gray-500">
        {isZh ? "已有账户？" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-blue-600 hover:underline"
        >
          {isZh ? "立即登录" : "Login now"}
        </button>
      </p>
    </form>
  )
}
