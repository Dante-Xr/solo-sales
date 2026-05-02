/**
 * 修改时间：2026-05-02 18:52:25 +08:00
 * 修改内容：将管理员权限详情、更新和删除路由收敛为薄控制器，删除保护和缓存失效迁移到 admin-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { handleApiError, successResponse } from "@/server/contracts/api"
import {
  deletePermissionById,
  getPermissionDetail,
  parseUpdatePermissionInput,
  requireAdminPermission,
  updatePermissionFromInput,
} from "@/server/services/admin-service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(request, "permissions.view")

    const { id } = await params
    const permission = await getPermissionDetail(id)

    return successResponse(permission)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminPermission(request, "permissions.update")

    const { id } = await params
    const input = parseUpdatePermissionInput(await request.json())
    const permission = await updatePermissionFromInput(request, admin.id, id, input)

    return successResponse(permission)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminPermission(request, "permissions.delete")

    // 删除权限前由 service 检查角色占用，避免破坏 RBAC 配置。
    const { id } = await params
    const result = await deletePermissionById(request, admin.id, id)

    return successResponse(result, { meta: { message: "删除成功" } })
  } catch (error) {
    return handleApiError(error)
  }
}
