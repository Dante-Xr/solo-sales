CREATE TYPE "AuthEmailWorkerRunTrigger" AS ENUM ('SCHEDULED', 'MANUAL', 'HTTP');
CREATE TYPE "AuthEmailWorkerRunStatus" AS ENUM ('SUCCEEDED', 'SKIPPED', 'FAILED');

CREATE TABLE "auth_email_worker_config" (
  "id" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "intervalMinutes" INTEGER NOT NULL DEFAULT 5,
  "batchSize" INTEGER NOT NULL DEFAULT 5,
  "lastHeartbeatAt" TIMESTAMP(3),
  "lastStartedAt" TIMESTAMP(3),
  "lastCompletedAt" TIMESTAMP(3),
  "leaseToken" TEXT,
  "leaseExpiresAt" TIMESTAMP(3),
  "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "auth_email_worker_config_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "auth_email_worker_run" (
  "id" TEXT NOT NULL,
  "configId" TEXT NOT NULL,
  "trigger" "AuthEmailWorkerRunTrigger" NOT NULL,
  "status" "AuthEmailWorkerRunStatus" NOT NULL,
  "processed" INTEGER NOT NULL DEFAULT 0,
  "delivered" INTEGER NOT NULL DEFAULT 0,
  "deadLettered" INTEGER NOT NULL DEFAULT 0,
  "error" TEXT,
  "initiatedById" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "auth_email_worker_run_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "auth_email_worker_run_configId_fkey" FOREIGN KEY ("configId") REFERENCES "auth_email_worker_config"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "auth_email_worker_config_leaseExpiresAt_idx" ON "auth_email_worker_config"("leaseExpiresAt");
CREATE INDEX "auth_email_worker_run_configId_startedAt_idx" ON "auth_email_worker_run"("configId", "startedAt");
CREATE INDEX "auth_email_worker_run_startedAt_idx" ON "auth_email_worker_run"("startedAt");

ALTER TYPE "TargetType" ADD VALUE IF NOT EXISTS 'SYSTEM_CONFIG';
