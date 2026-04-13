/**
 * ============================================
 * Better Auth API 路由 (Phase 2 安全修复)
 * ============================================
 * 创建日期: 2026-03-27
 * 功能说明：
 *   - Better Auth 的 Next.js 路由处理器
 *   - 接管所有 Better Auth 相关 API 请求
 *   - 包含登录、注册、会话管理等功能
 *
 * 路由说明：
 *   - GET/POST 请求由 better-auth 处理
 *   - 使用 toNextJsHandler 转换为 Next.js App Router 格式
 * ============================================
 */

import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

/**
 * 导出 GET 和 POST 方法
 * 绑定到 Better Auth 实例上
 */
export const { GET, POST } = toNextJsHandler(auth)
