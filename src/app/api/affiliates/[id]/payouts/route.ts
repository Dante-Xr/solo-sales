/**
 * 修改时间：2026-05-02 19:42:24 +08:00
 * 修改内容：统一联盟提现列表和申请路由响应与错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import AffiliateService from "@/lib/affiliate/AffiliateService"
import { safeErrorLog } from "@/lib/safeLog"
import { createdResponse, handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest } from "@/server/contracts/errors"
import { requireAdminPermission } from "@/server/services/admin-service"

const affiliateService = new AffiliateService(prisma)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(request, "affiliates.view")

    const { id } = await params
    const payouts = await affiliateService.getPayouts(id)

    return successResponse({ payouts })
  } catch (error) {
    safeErrorLog('Failed to get payouts', error)
    return handleApiError(error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(request, "affiliates.update")

    const { id } = await params
    const body = await request.json()
    const { amount, method, payoutInfo } = body

    if (!amount || !method) {
      throw badRequest("Amount and method are required")
    }

    // 提现金额、账户信息与余额校验集中交给 AffiliateService，route 不复制业务规则。
    const payout = await affiliateService.requestPayout({
      affiliateId: id,
      amount,
      method,
      payoutInfo
    })

    return createdResponse({ payout })
  } catch (error) {
    safeErrorLog('Failed to request payout', error)
    return handleApiError(error)
  }
}
