/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：将积分余额查询和账户创建路由收敛为薄控制器，账户逻辑迁移到 promotion-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { getServerSessionUser } from "@/server/auth/session"
import { badRequest, forbidden, unauthorized } from "@/server/contracts/errors"
import { requireAdminPermission } from "@/server/services/admin-service"
import {
  createPointsAccount,
  getPointsInfo,
  parsePointsQuery,
} from "@/server/services/promotion-service"

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getServerSessionUser()
    if (!sessionUser?.id) throw unauthorized("未登录")

    const { userId } = parsePointsQuery(request.nextUrl.searchParams)
    if (userId !== sessionUser.id) throw forbidden("不能访问其他用户的积分账户")

    const result = await getPointsInfo(userId)

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "points.update")

    const body = await request.json()
    const userId = typeof body?.userId === "string" ? body.userId : ""
    const action = body?.action

    // 保留旧 action=create 协议，避免前端创建积分账户调用同步改动。
    if (!userId) throw badRequest("缺少 userId 参数")
    if (action !== "create") throw badRequest("无效的操作")

    const account = await createPointsAccount(userId)
    return successResponse(account)
  } catch (error) {
    return handleApiError(error)
  }
}
