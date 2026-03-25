/**
 * ============================================
 * 积分 API 路由 (v0.5.5)
 * ============================================
 * 功能说明：
 *   - 获取用户积分余额
 *   - 获取积分计划信息
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "缺少 userId 参数" } },
        { status: 400 }
      )
    }

    const customerPoints = await prisma.customerPoints.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!customerPoints) {
      const defaultProgram = await prisma.loyaltyProgram.findFirst({
        where: { isActive: true },
      })

      return NextResponse.json({
        success: true,
        data: {
          balance: 0,
          totalEarned: 0,
          totalRedeemed: 0,
          tier: "BRONZE",
          program: defaultProgram,
        },
      })
    }

    const program = await prisma.loyaltyProgram.findFirst({
      where: { isActive: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...customerPoints,
        program,
      },
    })
  } catch (error) {
    console.error("获取积分信息失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "获取积分信息失败" } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "缺少 userId 参数" } },
        { status: 400 }
      )
    }

    if (action === "create") {
      const existing = await prisma.customerPoints.findUnique({
        where: { userId },
      })

      if (existing) {
        return NextResponse.json(
          { success: false, error: { code: "BAD_REQUEST", message: "积分账户已存在" } },
          { status: 400 }
        )
      }

      const customerPoints = await prisma.customerPoints.create({
        data: {
          userId,
          balance: 0,
          totalEarned: 0,
          totalRedeemed: 0,
          tier: "BRONZE",
        },
      })

      return NextResponse.json({
        success: true,
        data: customerPoints,
      })
    }

    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: "无效的操作" } },
      { status: 400 }
    )
  } catch (error) {
    console.error("积分操作失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "积分操作失败" } },
      { status: 500 }
    )
  }
}