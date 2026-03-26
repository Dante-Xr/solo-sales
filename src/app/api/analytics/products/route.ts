/**
 * ============================================
 * 数据分析商品报表 API (v0.6.0)
 * ============================================
 * GET /api/analytics/products - 获取商品报表
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
 * GET /api/analytics/products - 获取商品报表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeRange = (searchParams.get("timeRange") || "30d") as TimeRange

    const analytics = getAnalyticsService()
    const dateRange = analytics.getDateRange(timeRange)

    const productReport = await analytics.getProductReport(dateRange)

    return NextResponse.json({
      success: true,
      data: {
        ...productReport,
        period: dateRange
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error("Product analytics API error:", error)
    return NextResponse.json(
      { error: "获取商品报表失败" },
      { status: 500, headers: corsHeaders }
    )
  }
}
