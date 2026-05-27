/**
 * ?????2026-05-27
 * ????v0.1.0
 * ??????? 10 - SoloSales ??
 * ?????
 * 1. ????????????
 * 2. ?????? userId/userEmail??????? session?
 * 3. ?????????????????????????
 */
import "server-only"

import type { ServerSessionUser } from "@/server/auth/session"
import { getOrderByIdForViewer } from "@/server/services/order-service"
import { redactChatContext, type SafeChatContext } from "./chat-redaction-service"

export interface ChatClientBody {
  sessionId?: string
  message?: string
  orderId?: string
  userId?: string
  userEmail?: string
  locale?: string
}

export interface BuildSafeChatContextInput {
  sessionUser: ServerSessionUser | null
  clientBody: ChatClientBody
  findOrder?: typeof getOrderByIdForViewer
}

export async function buildSafeChatContext({
  sessionUser,
  clientBody,
  findOrder = getOrderByIdForViewer,
}: BuildSafeChatContextInput): Promise<SafeChatContext> {
  const context: Record<string, unknown> = {
    tenant_id: "solo-sales",
    is_logged_in: Boolean(sessionUser?.id),
    user_id: sessionUser?.id,
    user_email: sessionUser?.email,
  }

  if (sessionUser?.id && clientBody.orderId) {
    const order = await findOrder(clientBody.orderId, sessionUser)
    context.order_id = order.id
    context.order_status = order.status
    context.shipping_status = order.trackingNumber ? "已发货" : order.status
    context.tracking_number = order.trackingNumber ?? undefined
  }

  return redactChatContext(context)
}