/**
 * ============================================
 * 批发商品导入日志查询 API
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { getImportLogs } from "@/lib/wholesalers/logger"

/**
 * GET handler - 获取导入日志列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    const result = await getImportLogs(page, pageSize)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("获取导入日志失败:", error)
    return NextResponse.json(
      { success: false, error: "获取导入日志失败" },
      { status: 500 }
    )
  }
}