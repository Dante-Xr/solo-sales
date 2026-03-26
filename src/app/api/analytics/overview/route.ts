/**
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}

/**
 * GET /api/analytics/overview - 获取数据概览
 */
export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json({
      success: true,
      data: {
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
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error("Analytics overview API error:", error)
    return NextResponse.json(
      { error: "获取数据概览失败" },
      { status: 500, headers: corsHeaders }
    )
  }
}
