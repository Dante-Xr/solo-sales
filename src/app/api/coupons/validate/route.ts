/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：将优惠券校验路由收敛为薄控制器，折扣计算和使用限制迁移到 promotion-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { handleApiError, successResponse } from "@/server/contracts/api"
import {
  parseValidateCouponInput,
  validateCoupon,
} from "@/server/services/promotion-service"

export async function POST(request: NextRequest) {
  try {
    // 优惠券校验返回 valid=false 仍是业务成功响应，便于前端展示具体不可用原因。
    const input = parseValidateCouponInput(await request.json())
    const result = await validateCoupon(input)

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
