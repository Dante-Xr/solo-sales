/**
 * 修改时间：2026-05-02 19:42:24 +08:00
 * 修改内容：统一联盟会员链接列表和创建路由响应与错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import AffiliateService from "@/lib/affiliate/AffiliateService"
import { safeErrorLog } from "@/lib/safeLog"
import { createdResponse, handleApiError, successResponse } from "@/server/contracts/api"
import { requireAdminPermission } from "@/server/services/admin-service"

const affiliateService = new AffiliateService(prisma)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(request, "affiliates.view")

    const { id } = await params
    const links = await affiliateService.getAffiliateLinks(id)

    return successResponse({ links })
  } catch (error) {
    safeErrorLog('Failed to get affiliate links', error)
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
    const { productId, campaign, expiresAt } = body

    const link = await affiliateService.createAffiliateLink({
      affiliateId: id,
      productId,
      campaign,
      expiresAt
    })

    return createdResponse({ link })
  } catch (error) {
    safeErrorLog('Failed to create affiliate link', error)
    return handleApiError(error)
  }
}
