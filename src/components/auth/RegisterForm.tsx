"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

// 注册表单组件 Props 接口
interface RegisterFormProps {
  onSuccess?: () => void          // 注册成功后的回调
  onSwitchToLogin?: () => void    // 切换到登录表单的回调
}

// 注册表单组件
export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { language } = useLanguage()
  const isZh = language === "zh"
  const router = useRouter()
  const [name, setName] = useState("")                // 用户名
  const [email, setEmail] = useState("")               // 邮箱
  const [password, setPassword] = useState("")         // 密码
  const [confirmPassword, setConfirmPassword] = useState("")  // 确认密码
  const [showPassword, setShowPassword] = useState(false)     // 密码可见性
  const [loading, setLoading] = useState(false)       // 加载状态
  const [error, setError] = useState("")             // 错误信息

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // 验证两次密码输入一致
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
      // 调用注册 API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()

      // 注册失败
      if (!res.ok) {
        setError(data.error || (isZh ? "注册失败" : "Registration failed"))
        return
      }

      // 注册成功后自动登录
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      // 自动登录失败
      if (signInResult?.error) {
        setError(isZh ? "注册成功但登录失败，请手动登录" : "Registration successful but login failed, please login manually")
      } else {
        // 成功：执行回调并刷新
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
      {/* 用户名 */}
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

      {/* 邮箱 */}
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

      {/* 密码 */}
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
          {/* 密码可见性切换 */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 确认密码 */}
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

      {/* 错误提示 */}
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      {/* 注册按钮 */}
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

      {/* 切换到登录 */}
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
