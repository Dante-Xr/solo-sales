import { NextResponse } from "next/server"

// 开发环境内存用户存储（仅用于测试，生产环境请使用真实数据库）
const DEV_USERS: Array<{ id: string; email: string; password: string; name: string }> = []

// 用户注册接口
// POST /api/auth/register
// 请求体: { email, password, name }
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "邮箱和密码不能为空" },
        { status: 400 }
      )
    }

    const existingUser = DEV_USERS.find((u) => u.email === email)

    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 400 }
      )
    }

    const newUser = {
      id: `dev_user_${Date.now()}`,
      email,
      password, // 开发环境不加密存储
      name: name || email.split("@")[0],
    }

    DEV_USERS.push(newUser)

    return NextResponse.json({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    })
  } catch (error) {
    console.error("注册错误:", error)
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    )
  }
}
