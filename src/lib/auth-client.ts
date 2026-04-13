/**
 * ============================================
 * Better Auth 客户端配置 (Phase 2 安全修复)
 * ============================================
 * 功能说明：
 *   - 为前端提供统一的认证客户端
 *   - 使用 Better Auth 的 React 封装
 *   - 支持管理员插件的客户端功能
 * ============================================
 */

import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

/**
 * 创建认证客户端实例
 * 配置说明：
 *   - plugins: 加载管理员插件，提供管理员相关功能
 *
 * 导出的方法：
 *   - signIn: 用户登录（邮箱密码）
 *   - signUp: 用户注册
 *   - signOut: 用户登出
 *   - useSession: 响应式获取当前会话（用于 React 组件）
 *   - getSession: 获取当前会话（用于非 React 环境）
 */
export const authClient = createAuthClient({
  plugins: [
    adminClient(),
  ],
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient
