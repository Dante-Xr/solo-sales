/**
 * 修改时间：2026-05-02 18:52:25 +08:00
 * 修改内容：将管理员用户详情、更新和删除路由收敛为薄控制器，业务规则迁移到 admin-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { handleApiError, successResponse } from "@/server/contracts/api"
import {
  deleteAdminUserById,
  getAdminUserDetail,
  parseUpdateAdminUserInput,
  requireAdminPermission,
  updateAdminUserFromInput,
} from "@/server/services/admin-service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(request, "users.view")

    const { id } = await params
    const user = await getAdminUserDetail(id)

    return successResponse(user)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminPermission(request, "users.update")

    // service 负责防重复邮箱/用户名、角色存在性、密码哈希和权限缓存失效。
    const { id } = await params
    const input = parseUpdateAdminUserInput(await request.json())
    const user = await updateAdminUserFromInput(request, admin.id, id, input)

    return successResponse(user)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminPermission(request, "users.delete")

    const { id } = await params
    const result = await deleteAdminUserById(request, admin.id, id)

    return successResponse(result, { meta: { message: "删除成功" } })
  } catch (error) {
    return handleApiError(error)
  }
}
