/**
 * 修改时间：2026-05-02 19:21:48 +08:00
 * 修改内容：统一邮件序列触发路由响应与错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import EmailSequenceEngine from "@/lib/marketing/EmailSequenceEngine"
import { TriggerType } from "@prisma/client"
import { safeErrorLog } from "@/lib/safeLog"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest, notFound } from "@/server/contracts/errors"
import { requireAdminPermission } from "@/server/services/admin-service"

const engine = new EmailSequenceEngine(prisma)

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "sequences.update")

    const body = await request.json()
    const { trigger, userId, data } = body

    if (!trigger || !userId) {
      throw badRequest("Trigger type and user ID are required")
    }

    // 白名单限制触发类型，避免外部请求传入任意字符串驱动营销引擎。
    const validTriggers: TriggerType[] = [
      'ORDER_PLACED', 'ORDER_PAID', 'ORDER_SHIPPED', 'ORDER_DELIVERED',
      'CART_ABANDONED', 'PRODUCT_VIEWED', 'CUSTOMER_INACTIVE',
      'BIRTHDAY', 'FIRST_PURCHASE', 'MEMBERSHIP_TIER'
    ]

    if (!validTriggers.includes(trigger)) {
      throw badRequest("Invalid trigger type")
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    })

    if (!user?.email) {
      throw notFound("用户邮箱")
    }

    const results = await engine.processTrigger(trigger as TriggerType, {
      userId,
      userEmail: user.email,
      data
    })

    return successResponse({ results })
  } catch (error) {
    safeErrorLog('Failed to process trigger', error)
    return handleApiError(error)
  }
}
