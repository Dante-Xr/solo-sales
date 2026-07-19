import { PrismaClient } from "@prisma/client"

const valueOf = (name) => {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}
const operator = valueOf("--operator")
const reason = valueOf("--reason")
const jobId = valueOf("--job")
if (!operator || !reason || !jobId) {
  throw new Error("Usage: node scripts/replay-auth-email-dead-letter.mjs --job <id> --operator <id> --reason <text> [--confirm-production]")
}
if (process.env.NODE_ENV === "production" && !process.argv.includes("--confirm-production")) {
  throw new Error("Production dead-letter replay requires --confirm-production")
}

const prisma = new PrismaClient()
try {
  const result = await prisma.backgroundJob.updateMany({
    where: { id: jobId, type: "AUTH_EMAIL_DISPATCH", status: "DEAD_LETTER" },
    data: { status: "QUEUED", attempts: 0, lastError: null, lockedAt: null, lockToken: null, lockExpiresAt: null, availableAt: new Date() },
  })
  if (result.count !== 1) throw new Error("No matching auth-email dead-letter job found")
  console.log(JSON.stringify({ replayed: jobId, operator, reason }))
} finally {
  await prisma.$disconnect()
}
