/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：将积分获得路由收敛为薄控制器，积分计算、流水和等级更新迁移到 promotion-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { handleApiError, successResponse } from "@/server/contracts/api"
import {
  earnPoints,
  parseEarnPointsInput,
} from "@/server/services/promotion-service"

export async function POST(request: NextRequest) {
  try {
    const input = parseEarnPointsInput(await request.json())
    const result = await earnPoints(input)

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
