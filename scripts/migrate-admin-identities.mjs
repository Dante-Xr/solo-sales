import { randomUUID } from "node:crypto"
import { PrismaClient } from "@prisma/client"

const args = new Set(process.argv.slice(2))
const valueOf = (name) => {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}
const apply = args.has("--apply")
const operator = valueOf("--operator")
const reason = valueOf("--reason")

if (!operator || !reason) {
  throw new Error("Usage: node scripts/migrate-admin-identities.mjs --operator <id> --reason <text> [--apply] [--confirm-production]")
}
if (process.env.NODE_ENV === "production" && (!args.has("--confirm-production") || !apply)) {
  throw new Error("Production identity migration requires --apply --confirm-production")
}

const prisma = new PrismaClient()
try {
  const [admins, users, credentialAccounts] = await Promise.all([
    prisma.adminUser.findMany({ select: { id: true, email: true, username: true, userId: true, password: true } }),
    prisma.user.findMany({ select: { id: true, email: true, role: true } }),
    prisma.account.findMany({ where: { providerId: "credential" }, select: { id: true, userId: true, providerId: true } }),
  ])
  const normalize = (email) => email.trim().toLowerCase()
  const userByEmail = new Map()
  const userById = new Map(users.map((user) => [user.id, user]))
  const credentialByUserId = new Map(credentialAccounts.map((account) => [account.userId, account]))
  const adminEmails = new Map()
  const conflicts = []

  for (const user of users) {
    const email = normalize(user.email)
    if (userByEmail.has(email)) conflicts.push(`duplicate_user_email:${email}`)
    userByEmail.set(email, user)
  }

  for (const admin of admins) {
    const email = normalize(admin.email)
    const duplicate = adminEmails.get(email)
    if (duplicate && duplicate.id !== admin.id) conflicts.push(`duplicate_admin_email:${email}`)
    adminEmails.set(email, admin)
    const emailUser = userByEmail.get(email)
    const linkedUser = admin.userId ? userById.get(admin.userId) : undefined
    if (admin.userId && !linkedUser) conflicts.push(`linked_user_missing:${admin.id}`)
    if (linkedUser && normalize(linkedUser.email) !== email) conflicts.push(`linked_user_email_mismatch:${admin.id}`)
    if (emailUser && emailUser.role !== "admin") conflicts.push(`ordinary_user_email_collision:${email}`)
    if (linkedUser && linkedUser.role !== "admin") conflicts.push(`linked_user_not_admin:${admin.id}`)
    if (!admin.password && !linkedUser && !emailUser) conflicts.push(`missing_legacy_credential:${admin.id}`)
    if (!admin.password && (linkedUser || emailUser) && !credentialByUserId.has((linkedUser || emailUser).id)) conflicts.push(`missing_credential_account:${admin.id}`)
  }
  if (conflicts.length) throw new Error(`Identity migration preflight failed: ${conflicts.join(",")}`)

  const pending = admins.filter((admin) => !admin.userId || admin.password)
  console.log(JSON.stringify({ operator, reason, apply, pending: pending.length, totalAdmins: admins.length }))
  if (!apply) process.exit(0)

  await prisma.$transaction(async (tx) => {
    for (const admin of pending) {
      const email = normalize(admin.email)
      let user = admin.userId ? userById.get(admin.userId) : userByEmail.get(email)
      if (!user) {
        user = await tx.user.create({ data: { email, name: admin.username, role: "admin" }, select: { id: true, email: true, role: true } })
      } else if (user.email !== email || user.role !== "admin") {
        user = await tx.user.update({ where: { id: user.id }, data: { email, role: "admin" }, select: { id: true, email: true, role: true } })
      }
      const credential = credentialByUserId.get(user.id)
      if (!credential) {
        if (!admin.password) throw new Error(`Cannot create credential account without a legacy password for ${admin.id}`)
        await tx.account.create({ data: { id: randomUUID(), accountId: user.id, providerId: "credential", userId: user.id, password: admin.password } })
      } else if (admin.password) {
        await tx.account.update({ where: { id: credential.id }, data: { password: admin.password } })
      }
      await tx.adminUser.update({ where: { id: admin.id }, data: { userId: user.id, email, password: null } })
    }
  })
  console.log(JSON.stringify({ migrated: pending.length, operator, reason }))
} finally {
  await prisma.$disconnect()
}
