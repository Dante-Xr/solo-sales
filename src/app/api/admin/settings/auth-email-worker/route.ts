import { NextRequest } from "next/server"
import { z } from "zod"
import { successResponse, handleApiError } from "@/server/contracts/api"
import { requireAdminPermission } from "@/server/services/admin-service"
import { getAuthEmailWorkerStatus, updateAuthEmailWorkerConfig } from "@/server/services/auth-email-worker-service"
import { logUpdate } from "@/lib/permissionLog"
import { TargetType } from "@prisma/client"

const configSchema = z.object({
  enabled: z.boolean(),
  intervalMinutes: z.union([z.literal(1), z.literal(2), z.literal(5), z.literal(10)]),
  batchSize: z.union([z.literal(1), z.literal(3), z.literal(5), z.literal(10)]),
})

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "worker.view")
    return successResponse(await getAuthEmailWorkerStatus())
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdminPermission(request, "worker.manage")
    const before = (await getAuthEmailWorkerStatus()).config
    const input = configSchema.parse(await request.json())
    const config = await updateAuthEmailWorkerConfig(input)
    await logUpdate(request, admin.id, TargetType.SYSTEM_CONFIG, config.id, workerAuditData(before), workerAuditData(config))
    return successResponse(config)
  } catch (error) {
    return handleApiError(error)
  }
}

function workerAuditData(config: { enabled: boolean; intervalMinutes: number; batchSize: number }) {
  return { enabled: config.enabled, intervalMinutes: config.intervalMinutes, batchSize: config.batchSize }
}
