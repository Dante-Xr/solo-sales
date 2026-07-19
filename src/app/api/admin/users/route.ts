/**
 * 修改时间：2026-05-02 18:52:25 +08:00
 * 修改内容：将管理员用户列表和创建路由收敛为薄控制器，鉴权、校验、哈希和审计迁移到 admin-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { handleApiError, successResponse } from "@/server/contracts/api"
import {
  listAdminUsers,
  parseListAdminUsersQuery,
  requireAdminPermission,
} from "@/server/services/admin-service"
import { badRequest, forbidden } from "@/server/contracts/errors"

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "users.view")

    const query = parseListAdminUsersQuery(request.nextUrl.searchParams)
    const result = await listAdminUsers(query)

    return successResponse(result)
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminPermission(request, "users.create")
    if (admin.role.name !== "super_admin") throw forbidden("仅超级管理员可以创建管理员")
    throw badRequest("请先调用 /api/admin/users/activation/request 并完成 OTP 确认")
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
