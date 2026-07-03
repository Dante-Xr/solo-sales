/**
 * 修改时间：2026-05-02 19:42:24 +08:00
 * 修改内容：统一联盟转化记录路由响应与错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import AffiliateService from "@/lib/affiliate/AffiliateService"
import { safeErrorLog } from "@/lib/safeLog"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest } from "@/server/contracts/errors"
import { requireAdminPermission } from "@/server/services/admin-service"

const affiliateService = new AffiliateService(prisma)

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "affiliates.update")

    const body = await request.json()
    const { code, orderId, userId, orderAmount } = body

    if (!code || !orderId || !userId || !orderAmount) {
      throw badRequest("Code, orderId, userId, and orderAmount are required")
    }

    // 转化入账、佣金计算和幂等边界由 AffiliateService 统一处理。
    await affiliateService.recordConversion(code, orderId, userId, orderAmount)

    return successResponse({ recorded: true })
  } catch (error: unknown) {
    safeErrorLog('Failed to record conversion', error)
    return handleApiError(error)
  }
}
