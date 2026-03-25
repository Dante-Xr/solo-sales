/**
 * ============================================
 * 积分兑换 API 路由 (v0.5.5)
 * ============================================
 * 功能说明：
 *   - 积分兑换抵扣
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, points, orderId, description } = body

    if (!userId || points === undefined) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "缺少必要参数" } },
        { status: 400 }
      )
    }

    const customerPoints = await prisma.customerPoints.findUnique({
      where: { userId },
      include: { user: true },
    })

    if (!customerPoints) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "积分账户不存在" } },
        { status: 404 }
      )
    }

    const program = await prisma.loyaltyProgram.findFirst({
      where: { isActive: true },
    })

    const pointsRate = program?.pointsToYuan || 0.01
    const redeemAmount = points * pointsRate

    if (customerPoints.balance < points) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "积分余额不足" } },
        { status: 400 }
      )
    }

    if (program && points < program.minRedemption) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: `最低兑换积分为 ${program.minRedemption}` } },
        { status: 400 }
      )
    }

    const [updatedPoints, transaction] = await prisma.$transaction([
      prisma.customerPoints.update({
        where: { userId },
        data: {
          balance: customerPoints.balance - points,
          totalRedeemed: customerPoints.totalRedeemed + points,
        },
      }),
      prisma.pointTransaction.create({
        data: {
          customerPointsId: customerPoints.id,
          userId,
          amount: -points,
          type: "REDEEM",
          orderId: orderId || null,
          description: description || `积分兑换抵扣 ¥${redeemAmount.toFixed(2)}`,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        balance: updatedPoints.balance,
        redeemedPoints: points,
        redeemAmount,
        transaction,
      },
    })
  } catch (error) {
    console.error("积分兑换失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "积分兑换失败" } },
      { status: 500 }
    )
  }
}