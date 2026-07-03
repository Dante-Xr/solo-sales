"use client"

/**
 * CSRF Token Hook
 * 功能：自动获取 CSRF Token 并提供请求头注入
 */

import { useState, useEffect, useCallback } from "react"
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/csrf"

function getCookie(name: string): string | undefined {
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`))
  return match?.split("=").slice(1).join("=")
}

export function useCsrfToken() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchToken = useCallback(async () => {
    try {
      const res = await fetch("/api/csrf-token")
      if (res.ok) {
        const data = await res.json()
        setToken(data.token)
      }
    } catch (error: unknown) {
      console.error("获取 CSRF Token 失败:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const cookieToken = getCookie(CSRF_COOKIE_NAME)
    if (cookieToken) {
      setToken(cookieToken)
      setLoading(false)
    } else {
      fetchToken()
    }
  }, [fetchToken])

  const csrfHeaders: Record<string, string> = token
    ? { [CSRF_HEADER_NAME]: token }
    : {}

  return { token, loading, csrfHeaders }
}
