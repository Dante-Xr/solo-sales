/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：将产品详情、更新和删除路由收敛为薄控制器，业务规则迁移到 product-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { requireAdminPermission } from "@/server/services/admin-service"
import {
  deleteProductById,
  getProductDetail,
  parseUpdateProductInput,
  updateProductFromInput,
} from "@/server/services/product-service"

// 公开前台接口 — 供商品详情页使用，无需管理员权限
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await getProductDetail(id)

    return successResponse(product)
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(request, "products.update")
    const { id } = await params
    const input = parseUpdateProductInput(await request.json())
    const product = await updateProductFromInput(id, input)

    return successResponse(product)
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(request, "products.delete")
    const { id } = await params
    const result = await deleteProductById(id)

    return successResponse(result)
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
