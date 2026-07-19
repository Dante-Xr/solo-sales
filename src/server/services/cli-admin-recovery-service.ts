import bcrypt from "bcryptjs"
import { RecoveryFailureCode } from "@/lib/auth/recovery-audit"
import { recordAccountRecoveryAudit, type RecoveryAuditDatabase } from "./account-recovery-audit-service"

type RecoveryTransaction = {
  verification: {
    findUnique: (args: { where: { id: string } }) => Promise<{ value: string } | null>
    deleteMany: (args: { where: { id: string; identifier: string; expiresAt: { gt: Date } } }) => Promise<{ count: number }>
  }
  adminUser: {
    findFirst: (args: { where: { isActive: boolean; userId: string; role: { name: string } }; select: { id: boolean; email: boolean; userId: boolean } }) => Promise<{ id: string; email: string; userId: string | null } | null>
  }
  account: {
    updateMany: (args: { where: { userId: string; providerId: string }; data: { password: string } }) => Promise<{ count: number }>
  }
  session: { deleteMany: (args: { where: { userId: string } }) => Promise<unknown> }
}

export type RecoveryDatabase = {
  $transaction: <T>(callback: (tx: RecoveryTransaction) => Promise<T>) => Promise<T>
  accountRecoveryAudit: RecoveryAuditDatabase["accountRecoveryAudit"]
}

export async function completeCliAdminRecovery(input: {
  db: RecoveryDatabase
  token: string
  password: string
  hmacSecret: string
}) {
  let auditedEmail: string | null = null
  const success = await input.db.$transaction(async (tx) => {
    const verification = await tx.verification.findUnique({ where: { id: `reset-password:${input.token}` } })
    if (!verification) return false

    const consumed = await tx.verification.deleteMany({
      where: {
        id: `reset-password:${input.token}`,
        identifier: "cli-superadmin-recovery",
        expiresAt: { gt: new Date() },
      },
    })
    if (consumed.count !== 1) return false

    const admin = await tx.adminUser.findFirst({
      where: { isActive: true, userId: verification.value, role: { name: "super_admin" } },
      select: { id: true, email: true, userId: true },
    })
    if (!admin?.userId) return false

    const updated = await tx.account.updateMany({
      where: { userId: admin.userId, providerId: "credential" },
      data: { password: await bcrypt.hash(input.password, 12) },
    })
    if (updated.count !== 1) throw new Error("Missing credential account for super administrator")

    await tx.session.deleteMany({ where: { userId: admin.userId } })
    auditedEmail = admin.email
    return true
  })

  if (auditedEmail) {
    await recordAccountRecoveryAudit({
      db: input.db,
      event: {
        scope: "CLI_ADMIN_RECOVERY",
        result: success ? "ACCEPTED" : "REJECTED",
        failureCode: success ? undefined : RecoveryFailureCode.TOKEN_REPLAYED,
        email: auditedEmail,
        hmacSecret: input.hmacSecret,
      },
    })
  }
  return success
}
