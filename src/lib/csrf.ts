/**
 * CSRF 防护工具
 * 功能：生成和验证 CSRF Token，防止跨站请求伪造攻击
 */

export const CSRF_COOKIE_NAME = "solo_csrf_token"
export const CSRF_HEADER_NAME = "x-csrf-token"

const CSRF_TOKEN_EXPIRY_MS = 60 * 60 * 1000

function getSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET 环境变量未配置")
  }
  return secret
}

async function hmacSign(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function generateCsrfToken(): Promise<string> {
  const secret = getSecret()
  const timestamp = Date.now().toString(36)
  const randomPart = crypto.randomUUID().replace(/-/g, "").slice(0, 16)
  const payload = `${timestamp}.${randomPart}`
  const signature = await hmacSign(payload, secret)
  return `${payload}.${signature}`
}

export async function verifyCsrfToken(token: string): Promise<boolean> {
  if (!token) return false

  const parts = token.split(".")
  if (parts.length !== 3) return false

  const [timestampStr, randomPart, signature] = parts
  const secret = getSecret()
  const payload = `${timestampStr}.${randomPart}`
  const expectedSignature = await hmacSign(payload, secret)

  if (signature !== expectedSignature) return false

  const timestamp = parseInt(timestampStr, 36)
  const now = Date.now()
  if (now - timestamp > CSRF_TOKEN_EXPIRY_MS) return false

  return true
}
