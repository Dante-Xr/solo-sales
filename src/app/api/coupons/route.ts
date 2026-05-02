/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：将优惠券列表和创建路由收敛为薄控制器，业务逻辑迁移到 promotion-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { verifyAdminToken } from "@/lib/adminAuth"
import { createdResponse, handleApiError, successResponse } from "@/server/contracts/api"
import { unauthorized } from "@/server/contracts/errors"
import {
  createCouponFromInput,
  listCoupons,
  parseCreateCouponInput,
  parseListCouponsQuery,
} from "@/server/services/promotion-service"

export async function GET(request: NextRequest) {
  try {
    const query = parseListCouponsQuery(request.nextUrl.searchParams)
    const result = await listCoupons(query)

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) throw unauthorized("请先登录")

    // route 只保留管理员鉴权，优惠券字段校验和唯一性检查都交给 service。
    const input = parseCreateCouponInput(await request.json())
    const coupon = await createCouponFromInput(input)

    return createdResponse(coupon)
  } catch (error) {
    return handleApiError(error)
  }
}
