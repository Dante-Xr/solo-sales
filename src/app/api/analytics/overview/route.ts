/**
 * 修改时间：2026-05-02 19:10:31 +08:00
 * 修改内容：统一分析概览路由响应与错误处理，保留 CORS header 并清理手写响应模板。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 数据分析概览 API (v0.6.0)
 * ============================================
 * GET /api/analytics/overview - 获取数据概览
 * GET /api/analytics/sales - 获取销售报表
 * GET /api/analytics/customers - 获取客户报表
 * GET /api/analytics/products - 获取商品报表
 * GET /api/analytics/inventory - 获取库存报表
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
  // 分析接口可能被独立报表页面跨域调用，统一响应后仍补齐原有 CORS header。
  Object.entries(corsHeaders).forEach(([key, value]) => response.headers.set(key, value))
  return response
}

/**
 * GET /api/analytics/overview - 获取数据概览
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "analytics.view")
    const searchParams = request.nextUrl.searchParams
    const timeRange = (searchParams.get("timeRange") || "30d") as TimeRange

    const analytics = getAnalyticsService()
    const dateRange = analytics.getDateRange(timeRange)

    const [overview, trends, customerReport, productReport] = await Promise.all([
      analytics.getSalesOverview(dateRange),
      analytics.getSalesTrends(dateRange),
      analytics.getCustomerReport(dateRange),
      analytics.getProductReport(dateRange)
    ])

    return withCors(successResponse({
        overview,
        trends,
        customers: {
          totalCustomers: customerReport.totalCustomers,
          newCustomers: customerReport.newCustomers,
          returningCustomers: customerReport.returningCustomers,
          customerLTV: customerReport.customerLTV
        },
        products: {
          totalProducts: productReport.totalProducts,
          activeProducts: productReport.activeProducts,
          outOfStockProducts: productReport.outOfStockProducts
        },
        period: dateRange
      }))

  } catch (error) {
    return withCors(handleApiError(error))
  }
}
