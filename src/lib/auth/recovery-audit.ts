import { createHmac } from "node:crypto"

export const RecoveryFailureCode = {
  ACCOUNT_NOT_FOUND: "ACCOUNT_NOT_FOUND",
  ACCOUNT_SCOPE_MISMATCH: "ACCOUNT_SCOPE_MISMATCH",
  ACCOUNT_DISABLED: "ACCOUNT_DISABLED",
  OTP_INVALID: "OTP_INVALID",
  OTP_EXPIRED: "OTP_EXPIRED",
  OTP_ATTEMPTS_EXHAUSTED: "OTP_ATTEMPTS_EXHAUSTED",
  TOKEN_REPLAYED: "TOKEN_REPLAYED",
  RATE_LIMITED: "RATE_LIMITED",
  DEPENDENCY_UNAVAILABLE: "DEPENDENCY_UNAVAILABLE",
  DELIVERY_NOT_ACCEPTED: "DELIVERY_NOT_ACCEPTED",
} as const

export type RecoveryFailureCode = (typeof RecoveryFailureCode)[keyof typeof RecoveryFailureCode]

export type RecoveryAuditScope =
  | "USER_PASSWORD_RESET"
  | "ADMIN_PASSWORD_RESET"
  | "ADMIN_DELEGATED_RESET"
  | "ADMIN_EMAIL_CHANGE"
  | "ADMIN_ACTIVATION"
  | "CLI_ADMIN_RECOVERY"

export type RecoveryAuditResult = "ACCEPTED" | "REJECTED" | "FAILED"

type RecoveryAuditInput = {
  scope: RecoveryAuditScope
  result: RecoveryAuditResult
  failureCode?: RecoveryFailureCode
  email: string
  ipAddress?: string | null
  hmacSecret: string
}

const supportedFailureCodes = new Set<RecoveryFailureCode>(Object.values(RecoveryFailureCode))

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function fingerprint(value: string, hmacSecret: string) {
  return createHmac("sha256", hmacSecret).update(value).digest("hex")
}

export function createRecoveryAuditEvent(input: RecoveryAuditInput) {
  if (input.failureCode && !supportedFailureCodes.has(input.failureCode)) {
    throw new Error("Unsupported recovery failure code")
  }

  const normalizedEmail = normalizeEmail(input.email)

  return {
    scope: input.scope,
    result: input.result,
    failureCode: input.failureCode ?? null,
    accountFingerprint: fingerprint(`email:${normalizedEmail}`, input.hmacSecret),
    ipFingerprint: input.ipAddress
      ? fingerprint(`ip:${input.ipAddress}`, input.hmacSecret)
      : null,
  }
}
