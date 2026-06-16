/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：将分类 CRUD 路由收敛为薄控制器，名称冲突和删除保护迁移到 product-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { createdResponse, handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest } from "@/server/contracts/errors"
import { requireAdminPermission } from "@/server/services/admin-service"
import {
  createCategoryFromInput,
  deleteCategoryById,
  listCategories,
  parseCreateCategoryInput,
  parseUpdateCategoryInput,
  updateCategoryFromInput,
} from "@/server/services/product-service"

export async function GET() {
  try {
    const categories = await listCategories()
    return successResponse(categories)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "categories.create")
    const input = parseCreateCategoryInput(await request.json())
    const category = await createCategoryFromInput(input)

    return createdResponse(category)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdminPermission(request, "categories.update")
    const body = await request.json()
    const { id, ...updateData } = body

    // 分类更新接口沿用旧请求体格式：id 放在 body，其余字段作为更新数据。
    if (!id || typeof id !== "string") {
      throw badRequest("缺少分类 ID")
    }

    const input = parseUpdateCategoryInput(updateData)
    const category = await updateCategoryFromInput(id, input)

    return successResponse(category)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminPermission(request, "categories.delete")
    const id = request.nextUrl.searchParams.get("id")

    if (!id) {
      throw badRequest("缺少分类 ID")
    }

    const result = await deleteCategoryById(id)

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
