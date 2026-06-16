/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：将优惠券列表和创建路由收敛为薄控制器，业务逻辑迁移到 promotion-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { createdResponse, handleApiError, successResponse } from "@/server/contracts/api"
import { requireAdminPermission } from "@/server/services/admin-service"
import {
  createCouponFromInput,
  listCoupons,
  parseCreateCouponInput,
  parseListCouponsQuery,
} from "@/server/services/promotion-service"

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "coupons.view")

    const query = parseListCouponsQuery(request.nextUrl.searchParams)
    const result = await listCoupons(query)

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "coupons.update")

    // route 只保留管理员权限校验，优惠券字段校验和唯一性检查都交给 service。
    const input = parseCreateCouponInput(await request.json())
    const coupon = await createCouponFromInput(input)

    return createdResponse(coupon)
  } catch (error) {
    return handleApiError(error)
  }
}
