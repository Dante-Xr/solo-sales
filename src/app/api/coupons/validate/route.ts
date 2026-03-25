/**
 * ============================================
 * 优惠券校验 API 路由 (v0.5.5)
 * ============================================
 * 功能说明：
 *   - 校验优惠券是否有效
 *   - 计算折扣金额
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface ValidateCouponInput {
  code: string
  cartTotal: number
  userId: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidateCouponInput = await request.json()
    const { code, cartTotal, userId } = body

    if (!code || cartTotal === undefined || !userId) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "缺少必要参数" } },
        { status: 400 }
      )
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          error: "优惠券不存在",
        },
      })
    }

    if (!coupon.isActive) {
      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          error: "优惠券已禁用",
        },
      })
    }

    const now = new Date()
    if (coupon.startsAt && now < coupon.startsAt) {
      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          error: "优惠券还未开始生效",
        },
      })
    }

    if (coupon.expiresAt && now > coupon.expiresAt) {
      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          error: "优惠券已过期",
        },
      })
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          error: "优惠券已用完",
        },
      })
    }

    if (coupon.minAmount && cartTotal < coupon.minAmount) {
      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          error: `订单金额需满 ¥${coupon.minAmount} 才能使用此优惠券`,
        },
      })
    }

    const userUsageCount = await prisma.couponUsage.count({
      where: {
        couponId: coupon.id,
        userId,
      },
    })

    if (coupon.perUserLimit && userUsageCount >= coupon.perUserLimit) {
      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          error: "您已使用过此优惠券",
        },
      })
    }

    let discount = 0
    if (coupon.type === "PERCENTAGE") {
      discount = (cartTotal * coupon.value) / 100
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount)
      }
    } else {
      discount = coupon.value
    }

    discount = Math.min(discount, cartTotal)

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        discount,
        finalTotal: cartTotal - discount,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          type: coupon.type,
          value: coupon.value,
        },
      },
    })
  } catch (error) {
    console.error("校验优惠券失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "校验优惠券失败" } },
      { status: 500 }
    )
  }
}