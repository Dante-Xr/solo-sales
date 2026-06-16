/**
 * 修改时间：2026-05-02 18:37:11 +08:00
 * 修改内容：将库存预警路由收敛为薄控制器，配置查询、日志读取和 no-op 配置操作迁移到 inventory-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { requireAdminPermission } from "@/server/services/admin-service"
import {
  configureStockAlert,
  getStockAlertData,
  parseStockAlertInput,
  parseStockAlertQuery,
  removeStockAlert,
} from "@/server/services/inventory-service"

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "inventory.view")
    // service 保持旧接口语义：productId 返回默认配置，logs=true 返回预警日志数组。
    const query = parseStockAlertQuery(request.nextUrl.searchParams)
    const data = await getStockAlertData(query)

    return successResponse(data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "inventory.update")
    const input = parseStockAlertInput(await request.json())
    const result = await configureStockAlert(input)

    return successResponse(result, { meta: { message: "Stock alert configured successfully" } })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  return POST(request)
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminPermission(request, "inventory.update")
    const productId = request.nextUrl.searchParams.get("productId")
    const result = await removeStockAlert(productId ?? "")

    return successResponse(result, { meta: { message: "Stock alert deleted successfully" } })
  } catch (error) {
    return handleApiError(error)
  }
}
