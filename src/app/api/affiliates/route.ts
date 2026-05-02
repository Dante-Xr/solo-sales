/**
 * 修改时间：2026-05-02 19:42:24 +08:00
 * 修改内容：统一联盟会员列表和创建路由响应与错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import AffiliateService from "@/lib/affiliate/AffiliateService"
import { AffiliateStatus } from "@prisma/client"
import { safeErrorLog } from "@/lib/safeLog"
import { createdResponse, handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest, notFound } from "@/server/contracts/errors"

const affiliateService = new AffiliateService(prisma)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as AffiliateStatus | null
    const userId = searchParams.get('userId')

    if (userId) {
      const affiliate = await affiliateService.getAffiliateByUserId(userId)
      if (!affiliate) {
        throw notFound("联盟会员")
      }
      return successResponse({ affiliate })
    }

    const affiliates = await affiliateService.getAffiliates({
      status: status || undefined
    })

    return successResponse({ affiliates })
  } catch (error) {
    safeErrorLog('Failed to get affiliates', error)
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, commissionRate, payoutMethod, payoutInfo } = body

    if (!userId) {
      throw badRequest("User ID is required")
    }

    // AffiliateService 负责检查用户、费率与提现信息，route 只做必填字段保护。
    const affiliate = await affiliateService.createAffiliate({
      userId,
      commissionRate,
      payoutMethod,
      payoutInfo
    })

    return createdResponse({ affiliate })
  } catch (error) {
    safeErrorLog('Failed to create affiliate', error)
    return handleApiError(error)
  }
}
