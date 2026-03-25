import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function testLogin() {
  const email = "admin@solosales.com"
  const password = "Admin@123456"

  const admin = await prisma.adminUser.findUnique({
    where: { email },
    include: { role: true }
  })

  if (!admin) {
    console.log("❌ 用户不存在")
    return
  }

  console.log("✅ 找到用户:", admin.email)
  console.log("   用户名:", admin.username)
  console.log("   密码哈希:", admin.password.substring(0, 30) + "...")

  const isValid = await bcrypt.compare(password, admin.password)
  console.log("   密码验证:", isValid ? "✅ 通过" : "❌ 失败")

  if (!isValid) {
    const newHash = await bcrypt.hash(password, 10)
    console.log("   新哈希:", newHash.substring(0, 30) + "...")

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { password: newHash }
    })
    console.log("   已更新密码哈希")
  }
}

testLogin()
  .catch(console.error)
  .finally(() => prisma.$disconnect())