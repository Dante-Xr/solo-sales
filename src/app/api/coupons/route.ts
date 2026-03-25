/**
 * ============================================
 * 优惠券 API 路由 (v0.5.5)
 * ============================================
 * 功能说明：
 *   - 获取优惠券列表
 *   - 创建优惠券
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminToken } from "@/lib/adminAuth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get("isActive")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    const where: Record<string, unknown> = {}
    if (isActive === "true") where.isActive = true
    if (isActive === "false") where.isActive = false

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.coupon.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        coupons,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    })
  } catch (error) {
    console.error("获取优惠券列表失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "获取优惠券列表失败" } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "请先登录" } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      code,
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
    } = body

    if (!code || !name || !type || value === undefined) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "缺少必填字段" } },
        { status: 400 }
      )
    }

    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (existingCoupon) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "优惠券码已存在" } },
        { status: 400 }
      )
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
        type,
        value: parseFloat(value),
        minAmount: minAmount ? parseFloat(minAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    return NextResponse.json(
      { success: true, data: coupon },
      { status: 201 }
    )
  } catch (error) {
    console.error("创建优惠券失败:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "创建优惠券失败" } },
      { status: 500 }
    )
  }
}