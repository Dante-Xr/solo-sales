/**
 * 修改时间：2026-05-02 19:42:24 +08:00
 * 修改内容：统一联盟会员详情和更新路由响应与错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import AffiliateService from "@/lib/affiliate/AffiliateService"
import { AffiliateStatus } from "@prisma/client"
import { safeErrorLog } from "@/lib/safeLog"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { notFound } from "@/server/contracts/errors"

const affiliateService = new AffiliateService(prisma)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const affiliate = await affiliateService.getAffiliateById(id)

    if (!affiliate) {
      throw notFound("联盟会员")
    }

    const stats = await affiliateService.getAffiliateStats(id)

    return successResponse({ affiliate, stats })
  } catch (error) {
    safeErrorLog('Failed to get affiliate', error)
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { status, commissionRate, payoutMethod, payoutInfo } = body

    let affiliate

    if (status) {
      // 状态更新和资料更新分流到不同 service 方法，避免状态字段与普通资料混写。
      affiliate = await affiliateService.updateAffiliateStatus(id, status as AffiliateStatus)
    } else {
      affiliate = await affiliateService.updateAffiliate(id, {
        commissionRate,
        payoutMethod,
        payoutInfo
      })
    }

    return successResponse({ affiliate })
  } catch (error) {
    safeErrorLog('Failed to update affiliate', error)
    return handleApiError(error)
  }
}
