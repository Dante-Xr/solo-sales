/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：将优惠券详情、更新、删除路由收敛为薄控制器，业务规则迁移到 promotion-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { requireAdminPermission } from "@/server/services/admin-service"
import {
  deleteCouponById,
  getCouponDetail,
  parseUpdateCouponInput,
  updateCouponFromInput,
} from "@/server/services/promotion-service"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(_request, "coupons.view")

    const { id } = await params
    const coupon = await getCouponDetail(id)

    return successResponse(coupon)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(request, "coupons.update")

    const { id } = await params
    const input = parseUpdateCouponInput(await request.json())
    const coupon = await updateCouponFromInput(id, input)

    return successResponse(coupon)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(request, "coupons.update")

    const { id } = await params
    const result = await deleteCouponById(id)

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
