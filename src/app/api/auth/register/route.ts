/**
 * 2026-03-24: 用户注册接口
 * 功能：处理新用户注册请求，使用 bcrypt 对密码进行加密存储
 * 安全措施：
 *   1. Zod 请求体验证：邮箱格式、密码强度验证
 *   2. 使用 bcrypt.hash() 加密存储，不可逆
 *   3. 相同密码每次 hash 结果不同（加盐机制）
 *   4. Rate Limiting：5分钟内最多注册 3 次
 */
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { registerRateLimiter } from "@/middleware/rate-limit"
import { registerSchema, parseWithValidation } from "@/lib/validators"

// 开发环境内存用户存储（仅用于测试，生产环境请使用真实数据库）
// 2026-03-24: 密码已加密存储，不再是明文
const DEV_USERS: Array<{ id: string; email: string; password: string; name: string }> = []

// 用户注册接口
// POST /api/auth/register
// 请求体: { email, password, name }
export async function POST(request: Request) {
  // 2026-03-24: 限流检查
  const rateLimitResult = registerRateLimiter(request)
  if (!rateLimitResult.allowed && rateLimitResult.errorResponse) {
    return rateLimitResult.errorResponse
  }

  try {
    const body = await request.json()

    // 2026-03-24: 使用 Zod 验证请求体
    const validation = parseWithValidation(registerSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.errors[0].message, field: validation.errors[0].field },
        { status: 400 }
      )
    }

    const { email, password, name } = validation.data

    // 2026-03-24: 检查用户是否已存在
    const existingUser = DEV_USERS.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 400 }
      )
    }

    // 2026-03-24: 使用 bcrypt 加密密码，salt rounds = 10
    // rounds 越多越安全但越慢，10 是安全和性能的平衡点
    const hashedPassword = await bcrypt.hash(password, 10)

    // 2026-03-24: 创建新用户，密码使用加密后的 hash
    const newUser = {
      id: `dev_user_${Date.now()}`,
      email,
      password: hashedPassword, // 存储加密后的 hash，不可逆
      name: name || email.split("@")[0],
    }

    DEV_USERS.push(newUser)

    // 2026-03-24: 返回用户信息，不包含密码
    return NextResponse.json({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    })
  } catch (error) {
    // 2026-03-24: 错误日志，不泄露敏感信息
    console.error("注册错误:", error)
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    )
  }
}
