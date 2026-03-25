/**
 * ============================================
 * 积分获得 API 路由 (v0.5.5)
 * ============================================
 * 功能说明：
 *   - 订单完成后获得积分
 *   - 管理员手动添加积分
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, orderId, orderAmount, type, description } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "缺少 userId 参数" } },
        { status: 400 }
      )
    }

    let customerPoints = await prisma.customerPoints.findUnique({
      where: { userId },
    })

    if (!customerPoints) {
      customerPoints = await prisma.customerPoints.create({
        data: {
          userId,
          balance: 0,
          totalEarned: 0,
          totalRedeemed: 0,
          tier: "BRONZE",
        },
      })
    }

    const program = await prisma.loyaltyProgram.findFirst({
      where: { isActive: true },
    })

    const pointsRate = program?.pointsRate || 1.0
    const pointsToYuan = program?.pointsToYuan || 0.01

    let pointsToEarn = 0
    let earnDescription = ""

    if (type === "PURCHASE" && orderAmount) {
      pointsToEarn = Math.floor(orderAmount * pointsRate)
      earnDescription = description || `订单消费获得 ${pointsToEarn} 积分`
    } else if (type === "BONUS") {
      pointsToEarn = parseInt(orderAmount) || 0
      earnDescription = description || `奖励获得 ${pointsToEarn} 积分`
    } else if (type === "ADMIN") {
      pointsToEarn = parseInt(orderAmount) || 0
      earnDescription = description || `管理员调整获得 ${pointsToEarn} 积分`
    }

    if (pointsToEarn <= 0) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "积分数量必须大于 0" } },
        { status: 400 }
      )
    }

    const [updatedPoints, transaction] = await prisma.$transaction([
      prisma.customerPoints.update({
        where: { userId },
        data: {
          balance: customerPoints.balance + pointsToEarn,
          totalEarned: customerPoints.totalEarned + pointsToEarn,
        },
      }),
      prisma.pointTransaction.create({
        data: {
          customerPointsId: customerPoints.id,
          userId,
          amount: pointsToEarn,
          type: type === "BONUS" ? "BONUS" : type === "ADMIN" ? "ADJUST" : "EARN",
          orderId: orderId || null,
          description: earnDescription,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      }),
    ])

    const newTier = calculateTier(updatedPoints.totalEarned)
    if (newTier !== updatedPoints.tier) {
      await prisma.customerPoints.update({
        where: { userId },
        data: { tier: newTier },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        balance: updatedPoints.balance + pointsToEarn,
        earnedPoints: pointsToEarn,
        tier: newTier,
        transaction,
      },
    })
  } catch (error) {
    console.error("积分获得失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "积分获得失败" } },
      { status: 500 }
    )
  }
}

function calculateTier(totalEarned: number): "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" {
  if (totalEarned >= 10000) return "PLATINUM"
  if (totalEarned >= 5000) return "GOLD"
  if (totalEarned >= 1000) return "SILVER"
  return "BRONZE"
}