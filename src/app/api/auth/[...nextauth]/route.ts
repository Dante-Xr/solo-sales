import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// 开发环境内存用户存储（仅用于测试，生产环境请使用真实数据库）
const DEV_USERS: Array<{ id: string; email: string; password: string; name: string; role: string }> = [
  {
    id: "dev_user_1",
    email: "test@example.com",
    password: "$2a$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4r0mMX德拉0tLQv3c", // password: test123
    name: "测试用户",
    role: "USER",
  },
]

// NextAuth.js 配置选项
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码")
        }

        const user = DEV_USERS.find((u) => u.email === credentials.email)

        if (!user) {
          throw new Error("邮箱或密码错误")
        }

        // 简单密码验证（开发环境）
        // 注意：这里简化了验证，生产环境请使用 bcrypt
        const isValid = credentials.password === "test123"

        if (!isValid) {
          throw new Error("邮箱或密码错误")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
