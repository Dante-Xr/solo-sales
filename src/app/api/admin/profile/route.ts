/**
 * 修改时间：2026-05-02 18:52:25 +08:00
 * 修改内容：将管理员个人资料查询和更新路由收敛为薄控制器，会话校验、用户名冲突和密码校验迁移到 admin-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { handleApiError, successResponse } from "@/server/contracts/api"
import {
  getAdminProfile,
  parseUpdateProfileInput,
  updateAdminProfile,
} from "@/server/services/admin-service"

export async function GET(request: NextRequest) {
  try {
    const profile = await getAdminProfile(request)
    return successResponse(profile)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    // service 负责校验旧密码后再写入新密码，避免 route 持有密码处理细节。
    const input = parseUpdateProfileInput(await request.json())
    const profile = await updateAdminProfile(request, input)

    return successResponse(profile)
  } catch (error) {
    return handleApiError(error)
  }
}
