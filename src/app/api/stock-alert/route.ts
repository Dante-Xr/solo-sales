/**
 * ============================================
 * 库存预警配置 API (v0.5.8)
 * ============================================
 * 功能说明：
 *   - 创建/更新库存预警配置
 *   - 删除库存预警配置
 *   - 获取库存预警配置
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createOrUpdateStockAlert, deleteStockAlert, getStockAlertConfig, getStockAlertLogs } from "@/lib/services/StockAlertService"

const stockAlertSchema = z.object({
  productId: z.string().min(1),
  threshold: z.number().int().min(0),
  isEnabled: z.boolean(),
  notifyEmails: z.array(z.string().email()),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get("productId")

    if (productId) {
      const config = await getStockAlertConfig(productId)
      if (!config) {
        return NextResponse.json({
          success: true,
          data: {
            productId,
            threshold: 10,
            isEnabled: false,
            notifyEmails: [],
          },
        })
      }
      return NextResponse.json({ success: true, data: config })
    }

    const logsParam = searchParams.get("logs")
    if (logsParam === "true") {
      const limit = parseInt(searchParams.get("limit") || "50")
      const result = await getStockAlertLogs(undefined, limit)
      return NextResponse.json({ success: true, data: result.logs })
    }

    return NextResponse.json({ success: true, data: null })
  } catch (error) {
    console.error("Error getting stock alert config:", error)
    return NextResponse.json(
      { success: false, error: "Failed to get stock alert config" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = stockAlertSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid parameters", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { productId, threshold, isEnabled, notifyEmails } = parsed.data

    await createOrUpdateStockAlert({
      productId,
      threshold,
      isEnabled,
      notifyEmails,
    })

    return NextResponse.json({ success: true, message: "Stock alert configured successfully" })
  } catch (error) {
    console.error("Error creating stock alert:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create stock alert" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  return POST(request)
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      )
    }

    await deleteStockAlert(productId)

    return NextResponse.json({ success: true, message: "Stock alert deleted successfully" })
  } catch (error) {
    console.error("Error deleting stock alert:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete stock alert" },
      { status: 500 }
    )
  }
}