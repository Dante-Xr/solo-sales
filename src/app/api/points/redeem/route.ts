/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：将积分兑换路由收敛为薄控制器，余额校验、最低兑换和流水创建迁移到 promotion-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { requireAdminPermission } from "@/server/services/admin-service"
import {
  parseRedeemPointsInput,
  redeemPoints,
} from "@/server/services/promotion-service"

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "points.update")

    const input = parseRedeemPointsInput(await request.json())
    const result = await redeemPoints(input)

    return successResponse(result)
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
