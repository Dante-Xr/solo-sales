import { NextRequest } from "next/server"
import { successResponse, handleApiError } from "@/server/contracts/api"
import { requireAdminPermission } from "@/server/services/admin-service"
import { dispatchAuthEmailJobs } from "@/server/services/auth-email-job-service"
import { runAuthEmailWorker } from "@/server/services/auth-email-worker-service"

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminPermission(request, "worker.manage")
    const result = await runAuthEmailWorker({ trigger: "MANUAL", initiatedById: admin.id, bypassInterval: true, dispatch: dispatchAuthEmailJobs })
    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
