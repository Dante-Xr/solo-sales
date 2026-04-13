/**
 * ============================================
 * AuthProvider 组件 (Phase 2 安全修复)
 * ============================================
 * 功能说明：
 *   - 提供认证上下文
 *   - 简化后不再需要 SessionProvider 包装
 *
 * 说明：
 *   - Better Auth 的 useSession 是响应式的，无需 Provider 包装
 *   - 保留此组件仅为兼容旧代码
 * ============================================
 */

"use client"

import { authClient } from "@/lib/auth-client"
import { ReactNode } from "react"

export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export default AuthProvider
