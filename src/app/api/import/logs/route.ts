/**
 * 修改时间：2026-05-02 18:37:11 +08:00
 * 修改内容：将批发商品导入日志路由收敛为薄控制器，分页查询迁移到 inventory-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { requireAdminPermission } from "@/server/services/admin-service"
import { listImportLogs, parseImportLogsQuery } from "@/server/services/inventory-service"

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "products.import")
    // 分页参数统一交给 service schema 校验，避免 route 内散落 parseInt 默认值。
    const query = parseImportLogsQuery(request.nextUrl.searchParams)
    const result = await listImportLogs(query)

    return successResponse(result)
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
