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
import { getServerSessionUser } from "@/server/auth/session"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { unauthorized, validationError } from "@/server/contracts/errors"
import { requireAdminPermission } from "@/server/services/admin-service"

const cartItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().positive(),
  image: z.string().optional(),
})

const recordCartSchema = z.object({
  cartData: z.array(cartItemSchema),
  totalAmount: z.number().positive(),
  locale: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get("action")

    if (action === "check") {
      await requireAdminPermission(request, "abandonedCarts.update")

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
    const sessionUser = await getServerSessionUser()
    if (!sessionUser?.id || !sessionUser.email) {
      throw unauthorized("请先登录")
    }

    const body = await request.json()
    const parsed = recordCartSchema.safeParse(body)

    if (!parsed.success) {
      throw validationError("Invalid parameters", parsed.error.issues)
    }

    const { cartData, totalAmount, locale } = parsed.data

    // 用户身份只来自服务端会话，避免调用方伪造废弃购物车归属。
    const cartId = await recordAbandonedCart({
      userId: sessionUser.id,
      userEmail: sessionUser.email,
      userName: sessionUser.name ?? undefined,
      cartData,
      totalAmount,
      locale,
    })

    return successResponse({ cartId })
  } catch (error) {
    return handleApiError(error)
  }
}
