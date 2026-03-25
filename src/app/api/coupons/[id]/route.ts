/**
 * ============================================
 * 优惠券详情 API 路由 (v0.5.5)
 * ============================================
 * 功能说明：
 *   - 获取优惠券详情
 *   - 更新优惠券
 *   - 删除优惠券
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminToken } from "@/lib/adminAuth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        usages: {
          take: 10,
          orderBy: { usedAt: "desc" },
        },
      },
    })

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "优惠券不存在" } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: coupon,
    })
  } catch (error) {
    console.error("获取优惠券详情失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "获取优惠券详情失败" } },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "请先登录" } },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const {
      name,
      description,
      type,
      value,
      minAmount,
      maxDiscount,
      maxUses,
      perUserLimit,
      startsAt,
      expiresAt,
      isActive,
    } = body

    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    })

    if (!existingCoupon) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "优惠券不存在" } },
        { status: 404 }
      )
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(value !== undefined && { value: parseFloat(value) }),
        ...(minAmount !== undefined && { minAmount: minAmount ? parseFloat(minAmount) : null }),
        ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null }),
        ...(maxUses !== undefined && { maxUses: maxUses ? parseInt(maxUses) : null }),
        ...(perUserLimit !== undefined && { perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1 }),
        ...(startsAt !== undefined && { startsAt: startsAt ? new Date(startsAt) : null }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({
      success: true,
      data: coupon,
    })
  } catch (error) {
    console.error("更新优惠券失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "更新优惠券失败" } },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "请先登录" } },
        { status: 401 }
      )
    }

    const { id } = await params

    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    })

    if (!existingCoupon) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "优惠券不存在" } },
        { status: 404 }
      )
    }

    await prisma.coupon.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "优惠券已删除",
    })
  } catch (error) {
    console.error("删除优惠券失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "删除优惠券失败" } },
      { status: 500 }
    )
  }
}