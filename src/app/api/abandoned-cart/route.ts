/**
 * 修改时间：2026-05-02 20:43:25 +08:00
 * 修改内容：统一废弃购物车路由响应与错误处理，保留手动检查和记录购物车行为。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 废弃购物车 API (v0.5.8)
 * ============================================
 * 功能说明：
 *   - 记录废弃购物车
 *   - 获取废弃购物车列表 (管理员)
 *   - 手动触发检查
 * ============================================
 */

import { NextRequest } from "next/server"
import { z } from "zod"
import { checkAbandonedCarts, recordAbandonedCart } from "@/lib/services/AbandonedCartService"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { validationError } from "@/server/contracts/errors"

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
      return successResponse({
        processed: result.processed,
        emailsSent: result.emailsSent,
        recovered: result.recovered,
      })
    }

    return successResponse(null)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = recordCartSchema.safeParse(body)

    if (!parsed.success) {
      throw validationError("Invalid parameters", parsed.error.issues)
    }

    const { userId, userEmail, userName, cartData, totalAmount, locale } = parsed.data

    // 只把通过 schema 校验的购物车快照交给服务层，避免保存结构不完整的恢复数据。
    const cartId = await recordAbandonedCart({
      userId,
      userEmail,
      userName,
      cartData,
      totalAmount,
      locale,
    })

    return successResponse({ cartId })
  } catch (error) {
    return handleApiError(error)
  }
}
