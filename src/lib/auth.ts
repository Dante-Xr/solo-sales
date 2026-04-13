/**
 * ============================================
 * Better Auth 认证配置 (Phase 2 安全修复)
 * ============================================
 * 功能说明：
 *   - 替代 NextAuth + Base64 伪造 Token 的双重认证体系
 *   - 使用 Better Auth 作为统一认证方案
 *   - Session 存储在数据库中，支持即时撤销
 *   - Cookie 使用 HMAC 签名防篡改
 * ============================================
 */

import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { prisma } from "./prisma"

/**
 * 创建 Better Auth 实例
 * 配置说明：
 *   - database: 使用 Prisma 适配器连接 PostgreSQL
 *   - emailAndPassword: 启用邮箱密码认证，最小密码长度 6 位
 *   - session: 会话有效期 7 天，24 小时后更新，启用 5 分钟 Cookie 缓存
 *   - plugins:
 *     - admin: 管理员插件，提供用户管理、权限管理等功能
 *     - nextCookies: Next.js Cookie 支持，确保 Cookie 在服务端正确设置
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  plugins: [
    admin(),
    nextCookies(),
  ],
})

export type Auth = typeof auth
