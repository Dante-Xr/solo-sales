import { randomUUID } from "node:crypto"
import { PrismaClient } from "@prisma/client"

const valueOf = (name) => {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}
const email = valueOf("--email")?.trim().toLowerCase()
const operator = valueOf("--operator")
const reason = valueOf("--reason")
if (!email || !operator || !reason) throw new Error("Usage: node scripts/recover-last-superadmin.mjs --email <email> --operator <id> --reason <text> [--confirm-production]")
if (process.env.NODE_ENV === "production" && !process.argv.includes("--confirm-production")) throw new Error("Production recovery requires --confirm-production")

const prisma = new PrismaClient()
try {
  const superAdmins = await prisma.adminUser.findMany({ where: { isActive: true, role: { name: "super_admin" } }, select: { id: true, email: true, userId: true } })
  if (superAdmins.length !== 1 || superAdmins[0].email.trim().toLowerCase() !== email) throw new Error("CLI recovery is restricted to the unique active super administrator")
  const admin = superAdmins[0]
  const user = admin.userId ? await prisma.user.findUnique({ where: { id: admin.userId }, select: { id: true } }) : await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (!user) throw new Error("Super administrator has no Better Auth user identity; run identity migration first")
  const token = randomUUID()
  await prisma.verification.create({ data: { id: `reset-password:${token}`, identifier: "cli-superadmin-recovery", value: user.id, expiresAt: new Date(Date.now() + 15 * 60 * 1000) } })
  const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_URL
  if (!baseUrl) throw new Error("BETTER_AUTH_URL or NEXT_PUBLIC_URL is required to render recovery link")
  console.log(JSON.stringify({ operator, reason, expiresInMinutes: 15, recoveryLink: `${baseUrl}/zh/admin/reset-password#token=${token}` }))
} finally {
  await prisma.$disconnect()
}
