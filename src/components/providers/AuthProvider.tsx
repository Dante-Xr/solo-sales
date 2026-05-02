/**
 * 修改时间：2026-05-02 21:19:13 +08:00
 * 修改内容：清理认证 Provider 未使用的 authClient 导入，推进 M5 lint warnings 收敛。
 * 修改模型：gpt-5.5
 *
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

import { ReactNode } from "react"

export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export default AuthProvider
