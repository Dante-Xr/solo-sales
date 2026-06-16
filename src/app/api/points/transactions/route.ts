/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：将积分交易记录路由收敛为薄控制器，分页和账户缺省逻辑迁移到 promotion-service。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { getServerSessionUser } from "@/server/auth/session"
import { forbidden, unauthorized } from "@/server/contracts/errors"
import {
  listPointTransactions,
  parsePointTransactionsQuery,
} from "@/server/services/promotion-service"

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getServerSessionUser()
    if (!sessionUser?.id) throw unauthorized("未登录")

    const query = parsePointTransactionsQuery(request.nextUrl.searchParams)
    if (query.userId !== sessionUser.id) throw forbidden("不能访问其他用户的积分流水")

    const result = await listPointTransactions(query)

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
