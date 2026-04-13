/**
 * ============================================
 * 认证弹窗组件 (Phase 2 安全修复)
 * ============================================
 * 功能说明：
 *   - 整合登录、注册、访客结账三种模式
 *   - 使用 Tabs 组件切换不同模式
 *   - 已登录用户自动隐藏
 *
 * 认证说明：
 *   - 使用 Better Auth 的 useSession 判断登录状态
 *   - 已登录用户不显示弹窗（返回 null）
 * ============================================
 */

"use client"

import { useState } from "react"
import { useSession } from "@/lib/auth-client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "./LoginForm"
import { RegisterForm } from "./RegisterForm"
import { GuestCheckoutForm, GuestCheckoutData } from "./GuestCheckoutForm"
import { useLanguage } from "@/context/LanguageContext"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: "login" | "register" | "guest"  // 默认显示模式
  onGuestCheckout?: (data: GuestCheckoutData) => Promise<void>  // 访客结账回调
}

/**
 * 认证弹窗组件
 *
 * 三种模式：
 *   1. login - 用户登录
 *   2. register - 用户注册
 *   3. guest - 访客结账（无需登录）
 *
 * 使用 Better Auth useSession 判断是否已登录
 * 已登录用户自动隐藏弹窗
 */
export function AuthModal({ isOpen, onClose, mode = "login", onGuestCheckout }: AuthModalProps) {
  // 使用 Better Auth 的响应式 Session
  const { data: session } = useSession()
  const { language } = useLanguage()
  const isZh = language === "zh"
  const [activeTab, setActiveTab] = useState<string>(mode)

  // 登录成功回调：关闭弹窗
  const handleLoginSuccess = () => {
    onClose()
  }

  // 注册成功回调：关闭弹窗
  const handleRegisterSuccess = () => {
    onClose()
  }

  // 访客结账提交回调
  const handleGuestSubmit = async (data: GuestCheckoutData) => {
    if (onGuestCheckout) {
      await onGuestCheckout(data)
      onClose()
    }
  }

  // 已登录用户不显示弹窗
  if (session) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {/* 根据当前 Tab 显示不同标题 */}
            {activeTab === "guest" ? (isZh ? "访客结账" : "Guest Checkout") : (isZh ? "欢迎回来" : "Welcome Back")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {activeTab === "guest"
              ? (isZh ? "填写收货信息完成下单" : "Fill in shipping info to complete order")
              : (isZh ? "登录您的账户以继续购买" : "Login to continue shopping")}
          </DialogDescription>
        </DialogHeader>

        {/* Tab 切换：登录 / 注册 / 访客 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">{isZh ? "登录" : "Login"}</TabsTrigger>
            <TabsTrigger value="register">{isZh ? "注册" : "Register"}</TabsTrigger>
            <TabsTrigger value="guest">{isZh ? "访客结账" : "Guest"}</TabsTrigger>
          </TabsList>

          {/* 登录表单 */}
          <TabsContent value="login" className="mt-4">
            <LoginForm
              onSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setActiveTab("register")}
            />
          </TabsContent>

          {/* 注册表单 */}
          <TabsContent value="register" className="mt-4">
            <RegisterForm
              onSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => setActiveTab("login")}
            />
          </TabsContent>

          {/* 访客结账表单 */}
          <TabsContent value="guest" className="mt-4">
            <GuestCheckoutForm
              onSubmit={handleGuestSubmit}
              onSwitchToLogin={() => setActiveTab("login")}
              onSwitchToRegister={() => setActiveTab("register")}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
