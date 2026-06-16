/**
 * ============================================
 * 认证弹窗组件 (Phase 4 国际化升级)
 * ============================================
 * 2026-04-13: 更新为使用 next-intl 国际化
 * 功能说明：
 *   - 整合登录、注册两种模式
 *   - 使用 Tabs 组件切换不同模式
 *   - 已登录用户自动隐藏
 *   - 使用 next-intl 进行国际化
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
import { useTranslations } from "next-intl"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: "login" | "register"  // 默认显示模式
}

/**
 * 认证弹窗组件
 *
 * 两种模式：
 *   1. login - 用户登录
 *   2. register - 用户注册
 *
 * 使用 Better Auth useSession 判断是否已登录
 * 已登录用户自动隐藏弹窗
 */
export function AuthModal({ isOpen, onClose, mode = "login" }: AuthModalProps) {
  // 使用 Better Auth 的响应式 Session
  const { data: session } = useSession()
  const t = useTranslations()
  const [activeTab, setActiveTab] = useState<string>(mode)

  // 登录成功回调：关闭弹窗
  const handleLoginSuccess = () => {
    onClose()
  }

  // 注册成功回调：关闭弹窗
  const handleRegisterSuccess = () => {
    onClose()
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
            {t('auth.loginTitle')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t('auth.loginDesc')}
          </DialogDescription>
        </DialogHeader>

        {/* Tab 切换：登录 / 注册 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
            <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
          </TabsList>

          {/* 登录表单 */}
          <TabsContent value="login" className="mt-4">
            <LoginForm
              onSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setActiveTab('register')}
            />
          </TabsContent>

          {/* 注册表单 */}
          <TabsContent value="register" className="mt-4">
            <RegisterForm
              onSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
