/**
 * 修改时间：2026-05-02 18:52:25 +08:00
 * 修改内容：将管理员角色详情、更新和删除路由收敛为薄控制器，权限连接和删除保护迁移到 admin-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { handleApiError, successResponse } from "@/server/contracts/api"
import {
  deleteRoleById,
  getRoleDetail,
  parseUpdateRoleInput,
  requireAdminPermission,
  updateRoleFromInput,
} from "@/server/services/admin-service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(request, "roles.view")

    const { id } = await params
    const role = await getRoleDetail(id)

    return successResponse(role)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminPermission(request, "roles.update")

    const { id } = await params
    const input = parseUpdateRoleInput(await request.json())
    const role = await updateRoleFromInput(request, admin.id, id, input)

    return successResponse(role)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminPermission(request, "roles.delete")

    // service 会阻止删除仍有关联管理员的角色，并负责权限缓存失效。
    const { id } = await params
    const result = await deleteRoleById(request, admin.id, id)

    return successResponse(result, { meta: { message: "删除成功" } })
  } catch (error) {
    return handleApiError(error)
  }
}
