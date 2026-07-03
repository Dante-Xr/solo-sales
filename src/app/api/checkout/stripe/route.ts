/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：将 Stripe Checkout 路由收敛为薄控制器，改由服务端按数据库商品价格创建支付会话。
 * 修改模型：gpt-5.5
 */
import { csrfGuard } from "@/middleware/csrf-guard"
import { paymentRateLimiter } from "@/middleware/rate-limit"
import { getServerSessionUser } from "@/server/auth/session"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { unauthorized, validationError } from "@/server/contracts/errors"
import { createStripeCheckoutSession } from "@/server/services/payment-service"
import { isStripeTestMode } from "@/server/payments/stripe"

export { isStripeTestMode }

function getOrigin(request: Request) {
  return request.headers.get("origin") || "http://localhost:3000"
}

export async function POST(request: Request) {
  const csrfError = await csrfGuard(request)
  if (csrfError) return csrfError

  // 支付入口保留原有限流，避免 checkout session 被恶意批量创建。
  const rateLimitResult = paymentRateLimiter(request)
  if (!rateLimitResult.allowed && rateLimitResult.errorResponse) {
    return rateLimitResult.errorResponse
  }

  try {
    const sessionUser = await getServerSessionUser()
    if (!sessionUser?.id) {
      throw unauthorized("请先登录")
    }

    const body = await request.json()
    // 前端传来的 productName/price 会被忽略，服务端只接受定位商品和数量所需字段。
    const productId = typeof body?.productId === "string" ? body.productId : ""
    const quantity = Number(body?.quantity ?? 1)

    if (!productId || !Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
      throw validationError("支付参数无效", { productId, quantity })
    }

    const session = await createStripeCheckoutSession({
      productId,
      quantity,
      origin: getOrigin(request),
      userId: sessionUser.id,
      userEmail: sessionUser.email,
    })

    return successResponse(session)
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
