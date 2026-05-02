/**
 * 修改时间：2026-05-02 18:52:25 +08:00
 * 修改内容：将管理员权限列表和创建路由收敛为薄控制器，权限校验、唯一性和缓存失效迁移到 admin-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { createdResponse, handleApiError, successResponse } from "@/server/contracts/api"
import {
  createPermissionFromInput,
  listPermissions,
  parseCreatePermissionInput,
  parseListPermissionsQuery,
  requireAdminPermission,
} from "@/server/services/admin-service"

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "permissions.view")

    const query = parseListPermissionsQuery(request.nextUrl.searchParams)
    const result = await listPermissions(query)

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminPermission(request, "permissions.create")

    // service 统一处理权限标识唯一性、审计日志和全量权限缓存失效。
    const input = parseCreatePermissionInput(await request.json())
    const permission = await createPermissionFromInput(request, admin.id, input)

    return createdResponse(permission)
  } catch (error) {
    return handleApiError(error)
  }
}
