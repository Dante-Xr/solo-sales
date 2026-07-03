/**
 * 修改时间：2026-05-02 19:21:48 +08:00
 * 修改内容：统一邮件序列列表和创建路由响应与错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import EmailSequenceEngine from "@/lib/marketing/EmailSequenceEngine"
import { safeErrorLog } from "@/lib/safeLog"
import { TriggerType, SequenceStatus } from "@prisma/client"
import { createdResponse, handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest } from "@/server/contracts/errors"
import { requireAdminPermission } from "@/server/services/admin-service"

const engine = new EmailSequenceEngine(prisma)

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "sequences.view")

    const searchParams = request.nextUrl.searchParams
    const trigger = searchParams.get('trigger') as TriggerType | null
    const status = searchParams.get('status') as SequenceStatus | null

    const sequences = await engine.getSequences({
      trigger: trigger || undefined,
      status: status || undefined
    })

    return successResponse({ sequences })
  } catch (error: unknown) {
    safeErrorLog('Failed to get sequences', error)
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "sequences.update")

    const body = await request.json()

    const { name, description, trigger, steps } = body

    if (!name || !trigger) {
      throw badRequest("Name and trigger are required")
    }

    // 创建序列的 step 结构由 EmailSequenceEngine 统一解释，route 只做必要字段保护。
    const sequence = await engine.createSequence({
      name,
      description,
      trigger,
      steps
    })

    return createdResponse({ sequence })
  } catch (error: unknown) {
    safeErrorLog('Failed to create sequence', error)
    return handleApiError(error)
  }
}
