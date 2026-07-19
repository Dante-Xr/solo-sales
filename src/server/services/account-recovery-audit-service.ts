import {
  createRecoveryAuditEvent,
  type RecoveryAuditScope,
  type RecoveryAuditResult,
  type RecoveryFailureCode,
} from "@/lib/auth/recovery-audit"

export type RecoveryAuditDatabase = {
  accountRecoveryAudit: {
    create: (args: {
      data: {
        scope: RecoveryAuditScope
        result: RecoveryAuditResult
        failureCode: RecoveryFailureCode | null
        accountFingerprint: string
        ipFingerprint: string | null
        jobId: string | null
      }
    }) => Promise<unknown>
  }
}

export async function recordAccountRecoveryAudit(input: {
  db: RecoveryAuditDatabase
  event: {
    scope: RecoveryAuditScope
    result: RecoveryAuditResult
    failureCode?: RecoveryFailureCode
    email: string
    ipAddress?: string | null
    hmacSecret: string
  }
  jobId?: string
}) {
  const auditEvent = createRecoveryAuditEvent(input.event)

  try {
    await input.db.accountRecoveryAudit.create({
      data: {
        ...auditEvent,
        jobId: input.jobId ?? null,
      },
    })
  } catch {
    // The public recovery response must not disclose an audit-store outage.
  }
}
