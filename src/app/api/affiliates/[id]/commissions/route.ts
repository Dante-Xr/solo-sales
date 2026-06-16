/**
 * 修改时间：2026-05-02 19:42:24 +08:00
 * 修改内容：统一联盟佣金列表路由响应与错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import AffiliateService from "@/lib/affiliate/AffiliateService"
import { CommissionStatus } from "@prisma/client"
import { safeErrorLog } from "@/lib/safeLog"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { requireAdminPermission } from "@/server/services/admin-service"

const affiliateService = new AffiliateService(prisma)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(request, "affiliates.view")

    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as CommissionStatus | null

    const commissions = await affiliateService.getCommissions(id, {
      status: status || undefined
    })

    return successResponse({ commissions })
  } catch (error) {
    safeErrorLog('Failed to get commissions', error)
    return handleApiError(error)
  }
}
