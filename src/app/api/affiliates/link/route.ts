/**
 * 修改时间：2026-05-02 19:42:24 +08:00
 * 修改内容：统一联盟链接查询路由响应与错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import AffiliateService from "@/lib/affiliate/AffiliateService"
import { safeErrorLog } from "@/lib/safeLog"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest, notFound } from "@/server/contracts/errors"

const affiliateService = new AffiliateService(prisma)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')

    if (!code) {
      throw badRequest("Affiliate code is required")
    }

    const link = await affiliateService.getAffiliateLinkByCode(code)

    if (!link) {
      throw notFound("联盟链接")
    }

    return successResponse({ link })
  } catch (error) {
    safeErrorLog('Failed to get affiliate link by code', error)
    return handleApiError(error)
  }
}
