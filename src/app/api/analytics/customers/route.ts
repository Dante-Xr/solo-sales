/**
 * 修改时间：2026-05-02 19:10:31 +08:00
 * 修改内容：统一客户分析路由响应与错误处理，保留 CORS header 并清理手写响应模板。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 数据分析客户报表 API (v0.6.0)
 * ============================================
 * GET /api/analytics/customers - 获取客户报表
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { getAnalyticsService } from "@/lib/analytics/AnalyticsService"
import { TimeRange } from "@/lib/analytics/types"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { requireAdminPermission } from "@/server/services/admin-service"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}

function withCors<T extends NextResponse>(response: T): T {
  // 保持分析接口原有跨域能力，同时复用标准 API 响应体。
  Object.entries(corsHeaders).forEach(([key, value]) => response.headers.set(key, value))
  return response
}

/**
 * GET /api/analytics/customers - 获取客户报表
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "analytics.view")
    const searchParams = request.nextUrl.searchParams
    const timeRange = (searchParams.get("timeRange") || "30d") as TimeRange

    const analytics = getAnalyticsService()
    const dateRange = analytics.getDateRange(timeRange)

    const customerReport = await analytics.getCustomerReport(dateRange)

    return withCors(successResponse({
        ...customerReport,
        period: dateRange
      }))

  } catch (error) {
    return withCors(handleApiError(error))
  }
}
