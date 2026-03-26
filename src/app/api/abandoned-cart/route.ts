/**
 * ============================================
 * 废弃购物车 API (v0.5.8)
 * ============================================
 * 功能说明：
 *   - 记录废弃购物车
 *   - 获取废弃购物车列表 (管理员)
 *   - 手动触发检查
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { checkAbandonedCarts, recordAbandonedCart } from "@/lib/services/AbandonedCartService"

const cartItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().positive(),
  image: z.string().optional(),
})

const recordCartSchema = z.object({
  userId: z.string(),
  userEmail: z.string().email(),
  userName: z.string().optional(),
  cartData: z.array(cartItemSchema),
  totalAmount: z.number().positive(),
  locale: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get("action")

    if (action === "check") {
      const result = await checkAbandonedCarts()
      return NextResponse.json({
        success: true,
        data: {
          processed: result.processed,
          emailsSent: result.emailsSent,
          recovered: result.recovered,
        },
      })
    }

    return NextResponse.json({ success: true, data: null })
  } catch (error) {
    console.error("Error in abandoned cart API:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = recordCartSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid parameters", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { userId, userEmail, userName, cartData, totalAmount, locale } = parsed.data

    const cartId = await recordAbandonedCart({
      userId,
      userEmail,
      userName,
      cartData,
      totalAmount,
      locale,
    })

    return NextResponse.json({
      success: true,
      data: { cartId },
    })
  } catch (error) {
    console.error("Error recording abandoned cart:", error)
    return NextResponse.json(
      { success: false, error: "Failed to record abandoned cart" },
      { status: 500 }
    )
  }
}