"use client"

import { useState } from "react"
import { signIn, useSession } from "next-auth/react"
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

// 认证弹窗 Props 接口
interface AuthModalProps {
  isOpen: boolean                    // 弹窗是否打开
  onClose: () => void               // 关闭弹窗回调
  mode?: "login" | "register" | "guest"  // 默认选中的 Tab
  onGuestCheckout?: (data: GuestCheckoutData) => Promise<void>  // 访客结账提交回调
}

// 认证弹窗组件：整合登录、注册、访客结账三个 Tab
export function AuthModal({ isOpen, onClose, mode = "login", onGuestCheckout }: AuthModalProps) {
  const { data: session } = useSession()   // 当前用户 session
  const { language } = useLanguage()
  const isZh = language === "zh"
  const [activeTab, setActiveTab] = useState<string>(mode)  // 当前激活的 Tab

  // 登录成功处理
  const handleLoginSuccess = () => {
    onClose()
  }

  // 注册成功处理
  const handleRegisterSuccess = () => {
    onClose()
  }

  // 访客结账提交处理
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
          {/* 标题根据当前 Tab 动态显示 */}
          <DialogTitle className="text-xl font-bold text-center">
            {activeTab === "guest" ? (isZh ? "访客结账" : "Guest Checkout") : (isZh ? "欢迎回来" : "Welcome Back")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {activeTab === "guest"
              ? (isZh ? "填写收货信息完成下单" : "Fill in shipping info to complete order")
              : (isZh ? "登录您的账户以继续购买" : "Login to continue shopping")}
          </DialogDescription>
        </DialogHeader>

        {/* Tab 切换：登录 / 注册 / 访客结账 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">{isZh ? "登录" : "Login"}</TabsTrigger>
            <TabsTrigger value="register">{isZh ? "注册" : "Register"}</TabsTrigger>
            <TabsTrigger value="guest">{isZh ? "访客结账" : "Guest"}</TabsTrigger>
          </TabsList>

          {/* 登录表单 Tab */}
          <TabsContent value="login" className="mt-4">
            <LoginForm
              onSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setActiveTab("register")}
            />
          </TabsContent>

          {/* 注册表单 Tab */}
          <TabsContent value="register" className="mt-4">
            <RegisterForm
              onSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => setActiveTab("login")}
            />
          </TabsContent>

          {/* 访客结账 Tab */}
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
