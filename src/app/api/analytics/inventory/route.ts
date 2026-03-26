/**
 * ============================================
 * 数据分析库存报表 API (v0.6.0)
 * ============================================
 * GET /api/analytics/inventory - 获取库存报表
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { getAnalyticsService } from "@/lib/analytics/AnalyticsService"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}

/**
 * GET /api/analytics/inventory - 获取库存报表
 */
export async function GET(_request: NextRequest) {
  try {
    const analytics = getAnalyticsService()
    const inventoryReport = await analytics.getInventoryReport()

    return NextResponse.json({
      success: true,
      data: inventoryReport
    }, { headers: corsHeaders })

  } catch (error) {
    console.error("Inventory analytics API error:", error)
    return NextResponse.json(
      { error: "获取库存报表失败" },
      { status: 500, headers: corsHeaders }
    )
  }
}
