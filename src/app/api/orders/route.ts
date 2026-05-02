/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：将订单列表和创建逻辑迁移到服务层，并改为服务端重算订单金额。
 * 修改模型：gpt-5.5
 */
import { csrfGuard } from "@/middleware/csrf-guard"
import { getServerSessionUser } from "@/server/auth/session"
import { createdResponse, handleApiError, successResponse } from "@/server/contracts/api"
import {
  createOrder,
  getOrderByIdForViewer,
  listOrdersForUser,
  parseCreateOrderInput,
} from "@/server/services/order-service"

export async function GET(request: Request) {
  try {
    const sessionUser = await getServerSessionUser()
    const orderId = new URL(request.url).searchParams.get("id")

    // 保留旧查询方式 /api/orders?id=xxx，避免前台订单详情页同步改大面积调用。
    if (orderId) {
      const order = await getOrderByIdForViewer(orderId, sessionUser)
      return successResponse(order)
    }

    const orders = await listOrdersForUser(sessionUser)
    return successResponse(orders)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  const csrfError = await csrfGuard(request)
  if (csrfError) return csrfError

  try {
    // route 只做 HTTP 层工作：CSRF、解析请求体、调用 service、包装响应。
    const body = await request.json()
    const input = parseCreateOrderInput(body)
    const sessionUser = await getServerSessionUser()
    const order = await createOrder(input, sessionUser)

    return createdResponse(order)
  } catch (error) {
    return handleApiError(error)
  }
}
