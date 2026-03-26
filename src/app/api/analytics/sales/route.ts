/**
 * ============================================
 * 数据分析销售报表 API (v0.6.0)
 * ============================================
 * GET /api/analytics/sales - 获取销售报表
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
 * GET /api/analytics/sales - 获取销售报表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeRange = (searchParams.get("timeRange") || "30d") as TimeRange

    const analytics = getAnalyticsService()
    const dateRange = analytics.getDateRange(timeRange)

    const [overview, trends] = await Promise.all([
      analytics.getSalesOverview(dateRange),
      analytics.getSalesTrends(dateRange)
    ])

    return NextResponse.json({
      success: true,
      data: {
        overview,
        trends,
        period: dateRange
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error("Sales analytics API error:", error)
    return NextResponse.json(
      { error: "获取销售报表失败" },
      { status: 500, headers: corsHeaders }
    )
  }
}
