/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：将产品批量上下架和批量删除路由收敛为薄控制器，事务逻辑迁移到 product-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { requireAdminPermission } from "@/server/services/admin-service"
import {
  batchDeleteProducts,
  batchUpdateProducts,
  parseBatchUpdateProductsInput,
} from "@/server/services/product-service"

export async function PATCH(request: NextRequest) {
  try {
    await requireAdminPermission(request, "products.update")
    const input = parseBatchUpdateProductsInput(await request.json())
    const result = await batchUpdateProducts(input)

    return successResponse(result.data, { meta: { message: result.message } })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminPermission(request, "products.delete")
    // 批量删除沿用原有 query string 协议，service 负责校验空数组和订单关联。
    const idsParam = request.nextUrl.searchParams.get("ids")
    const ids = idsParam?.split(",").filter(Boolean) ?? []
    const result = await batchDeleteProducts(ids)

    return successResponse(result.data, { meta: { message: result.message } })
  } catch (error) {
    return handleApiError(error)
  }
}
