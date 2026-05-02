/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：将订单详情路由迁移到订单服务层，统一会话读取、权限判断和响应格式。
 * 修改模型：gpt-5.5
 */
import { getServerSessionUser } from "@/server/auth/session"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { getOrderByIdForViewer } from "@/server/services/order-service"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionUser = await getServerSessionUser()
    const order = await getOrderByIdForViewer(id, sessionUser)

    return successResponse(order)
  } catch (error) {
    return handleApiError(error)
  }
}
