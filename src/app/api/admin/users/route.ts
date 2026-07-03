/**
 * 修改时间：2026-05-02 18:52:25 +08:00
 * 修改内容：将管理员用户列表和创建路由收敛为薄控制器，鉴权、校验、哈希和审计迁移到 admin-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { createdResponse, handleApiError, successResponse } from "@/server/contracts/api"
import {
  createAdminUserFromInput,
  listAdminUsers,
  parseCreateAdminUserInput,
  parseListAdminUsersQuery,
  requireAdminPermission,
} from "@/server/services/admin-service"

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

    // 创建用户涉及密码哈希、唯一性检查和审计日志，全部集中在 service 保持 route 简洁。
    const input = parseCreateAdminUserInput(await request.json())
    const user = await createAdminUserFromInput(request, admin.id, input)

    return createdResponse(user)
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
