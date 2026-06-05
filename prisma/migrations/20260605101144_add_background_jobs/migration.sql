-- 修改时间：2026-06-05 10:11:44 +08:00
-- 修改内容：新增后台任务表、任务类型枚举和状态枚举，用于 Phase 5 重任务异步化准备。
-- 修改模型：gpt-5.5

CREATE TYPE "BackgroundJobType" AS ENUM (
  'WHOLESALER_IMPORT',
  'ANALYTICS_REFRESH',
  'STRIPE_WEBHOOK_POST_PROCESS',
  'NOTIFICATION_DISPATCH'
);

CREATE TYPE "BackgroundJobStatus" AS ENUM (
  'QUEUED',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'DEAD_LETTER'
);

CREATE TABLE "BackgroundJob" (
  "id" TEXT NOT NULL,
  "type" "BackgroundJobType" NOT NULL,
  "status" "BackgroundJobStatus" NOT NULL DEFAULT 'QUEUED',
  "payload" JSONB NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 3,
  "lastError" TEXT,
  "lockedAt" TIMESTAMP(3),
  "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BackgroundJob_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BackgroundJob_status_availableAt_idx" ON "BackgroundJob"("status", "availableAt");
CREATE INDEX "BackgroundJob_type_status_idx" ON "BackgroundJob"("type", "status");
CREATE INDEX "BackgroundJob_createdAt_idx" ON "BackgroundJob"("createdAt");
