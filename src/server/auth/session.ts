/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：新增服务端会话读取封装，统一 Better Auth headers 依赖和用户类型。
 * 修改模型：gpt-5.5
 */
import "server-only"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export interface ServerSessionUser {
  id?: string
  email?: string
  name?: string | null
  role?: string
}

export async function getServerSessionUser(): Promise<ServerSessionUser | null> {
  // Better Auth 依赖当前请求 headers；统一封装避免 route 中重复处理会话细节。
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return null
  }

  return session.user as ServerSessionUser
}
