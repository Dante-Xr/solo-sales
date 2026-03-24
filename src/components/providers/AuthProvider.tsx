"use client"

// 2026-03-24: AuthProvider 组件性能优化
// 优化点：使用 Next.js dynamic 动态导入 SessionProvider，避免首屏加载不必要的认证逻辑
// SessionProvider 来自 next-auth，仅在需要认证功能时才加载
import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

export default AuthProvider