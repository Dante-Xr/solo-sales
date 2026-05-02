/**
 * 修改时间：2026-05-02 18:37:11 +08:00
 * 修改内容：将批发商品导入路由收敛为薄控制器，导入流程迁移到 inventory-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { parseImportRequest, runWholesalerImport } from "@/server/services/inventory-service"

export async function POST(request: NextRequest) {
  try {
    // route 只解析请求体，批发商连接、商品映射、去重和入库统一由 service 控制。
    const input = parseImportRequest(await request.json())
    const result = await runWholesalerImport(input)

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
