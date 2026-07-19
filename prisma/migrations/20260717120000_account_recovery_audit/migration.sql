ALTER TYPE "BackgroundJobType" ADD VALUE IF NOT EXISTS 'AUTH_EMAIL_DISPATCH';

CREATE TYPE "RecoveryAuditScope" AS ENUM (
  'USER_PASSWORD_RESET',
  'ADMIN_PASSWORD_RESET',
  'ADMIN_DELEGATED_RESET',
  'ADMIN_EMAIL_CHANGE',
  'ADMIN_ACTIVATION',
  'CLI_ADMIN_RECOVERY'
);

CREATE TYPE "RecoveryAuditResult" AS ENUM ('ACCEPTED', 'REJECTED', 'FAILED');

CREATE TYPE "RecoveryFailureCode" AS ENUM (
  'ACCOUNT_NOT_FOUND',
  'ACCOUNT_SCOPE_MISMATCH',
  'ACCOUNT_DISABLED',
  'OTP_INVALID',
  'OTP_EXPIRED',
  'OTP_ATTEMPTS_EXHAUSTED',
  'TOKEN_REPLAYED',
  'RATE_LIMITED',
  'DEPENDENCY_UNAVAILABLE',
  'DELIVERY_NOT_ACCEPTED'
);

CREATE TABLE "account_recovery_audit" (
  "id" TEXT NOT NULL,
  "scope" "RecoveryAuditScope" NOT NULL,
  "result" "RecoveryAuditResult" NOT NULL,
  "failureCode" "RecoveryFailureCode",
  "accountFingerprint" TEXT NOT NULL,
  "ipFingerprint" TEXT,
  "jobId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "account_recovery_audit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "account_recovery_audit_createdAt_idx" ON "account_recovery_audit"("createdAt");
CREATE INDEX "account_recovery_audit_scope_result_createdAt_idx" ON "account_recovery_audit"("scope", "result", "createdAt");
CREATE INDEX "account_recovery_audit_accountFingerprint_createdAt_idx" ON "account_recovery_audit"("accountFingerprint", "createdAt");
CREATE INDEX "account_recovery_audit_jobId_idx" ON "account_recovery_audit"("jobId");

ALTER TABLE "AdminUser" ADD COLUMN "userId" TEXT;
CREATE UNIQUE INDEX "AdminUser_userId_key" ON "AdminUser"("userId");
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdminUser" ALTER COLUMN "password" DROP NOT NULL;

ALTER TABLE "BackgroundJob" ADD COLUMN "lockToken" TEXT;
ALTER TABLE "BackgroundJob" ADD COLUMN "lockExpiresAt" TIMESTAMP(3);
CREATE INDEX "BackgroundJob_status_lockExpiresAt_idx" ON "BackgroundJob"("status", "lockExpiresAt");
