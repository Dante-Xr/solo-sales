"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

// 登录表单组件 Props 接口
interface LoginFormProps {
  onSuccess?: () => void            // 登录成功后的回调
  onSwitchToRegister?: () => void   // 切换到注册表单的回调
}

// 登录表单组件
export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const { language } = useLanguage()
  const isZh = language === "zh"
  const router = useRouter()
  const [email, setEmail] = useState("")           // 邮箱状态
  const [password, setPassword] = useState("")     // 密码状态
  const [showPassword, setShowPassword] = useState(false)  // 密码可见性切换
  const [loading, setLoading] = useState(false)    // 加载状态
  const [error, setError] = useState("")          // 错误信息

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // 调用 NextAuth 的 signIn 进行登录
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      // 登录失败
      if (result?.error) {
        setError(isZh ? "邮箱或密码错误" : "Invalid email or password")
      } else {
        // 登录成功：执行成功回调并刷新页面
        onSuccess?.()
        router.refresh()
      }
    } catch {
      setError(isZh ? "登录失败，请稍后重试" : "Login failed, please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 邮箱输入框 */}
      <div className="space-y-2">
        <Label htmlFor="login-email">{isZh ? "邮箱" : "Email"}</Label>
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

      {/* 密码输入框 */}
      <div className="space-y-2">
        <Label htmlFor="login-password">{isZh ? "密码" : "Password"}</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder={isZh ? "输入密码" : "Enter password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="pr-10"
          />
          {/* 密码可见性切换按钮 */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      {/* 登录按钮 */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {isZh ? "登录中..." : "Logging in..."}
          </>
        ) : (
          isZh ? "登录" : "Login"
        )}
      </Button>

      {/* 切换到注册 */}
      <p className="text-center text-sm text-gray-500">
        {isZh ? "还没有账户？" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-blue-600 hover:underline"
        >
          {isZh ? "立即注册" : "Register now"}
        </button>
      </p>
    </form>
  )
}
