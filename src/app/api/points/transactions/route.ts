/**
 * ============================================
 * 积分交易记录 API 路由 (v0.5.5)
 * ============================================
 * 功能说明：
 *   - 获取积分交易记录
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const type = searchParams.get("type")

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "缺少 userId 参数" } },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = { userId }
    if (type) where.type = type

    const customerPoints = await prisma.customerPoints.findUnique({
      where: { userId },
    })

    if (!customerPoints) {
      return NextResponse.json({
        success: true,
        data: {
          transactions: [],
          pagination: { page, pageSize, total: 0, totalPages: 0 },
        },
      })
    }

    where.customerPointsId = customerPoints.id

    const [transactions, total] = await Promise.all([
      prisma.pointTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.pointTransaction.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    })
  } catch (error) {
    console.error("获取积分记录失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "获取积分记录失败" } },
      { status: 500 }
    )
  }
}