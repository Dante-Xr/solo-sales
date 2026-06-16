/**
 * 修改时间：2026-05-02 18:52:25 +08:00
 * 修改内容：将管理员角色列表和创建路由收敛为薄控制器，角色校验和审计迁移到 admin-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { createdResponse, handleApiError, successResponse } from "@/server/contracts/api"
import {
  createRoleFromInput,
  listRoles,
  parseCreateRoleInput,
  requireAdminPermission,
} from "@/server/services/admin-service"

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "roles.view")
    const roles = await listRoles()
    return successResponse(roles)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminPermission(request, "roles.create")

    // 角色唯一性、权限连接和审计日志都由 service 处理。
    const input = parseCreateRoleInput(await request.json())
    const role = await createRoleFromInput(request, admin.id, input)

    return createdResponse(role)
  } catch (error) {
    return handleApiError(error)
  }
}
