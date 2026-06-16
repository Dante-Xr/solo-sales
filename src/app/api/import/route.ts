/**
 * 修改时间：2026-06-05 10:11:44 +08:00
 * 修改内容：为批发商品导入路由增加可选异步入队模式，默认同步导入行为保持兼容。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { requireAdminPermission } from "@/server/services/admin-service"
import {
  enqueueWholesalerImport,
  parseImportRequest,
  runWholesalerImport,
} from "@/server/services/inventory-service"

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "products.import")
    // route 只解析请求体，批发商连接、商品映射、去重和入库统一由 service 控制。
    const input = parseImportRequest(await request.json())
    if (input.execution === "async") {
      const job = await enqueueWholesalerImport(input)

      return successResponse(
        {
          accepted: true,
          jobId: job.id,
          type: job.type,
          status: job.status,
        },
        {
          status: 202,
          meta: {
            execution: "async",
          },
        }
      )
    }

    const result = await runWholesalerImport(input)

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
