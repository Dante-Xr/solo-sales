/**
 * 修改时间：2026-05-02 19:21:48 +08:00
 * 修改内容：统一邮件序列报名、取消报名和状态更新路由响应与错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import EmailSequenceEngine from "@/lib/marketing/EmailSequenceEngine"
import { safeErrorLog } from "@/lib/safeLog"
import { createdResponse, handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest } from "@/server/contracts/errors"

const engine = new EmailSequenceEngine(prisma)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId, triggerData } = body

    if (!userId) {
      throw badRequest("User ID is required")
    }

    const enrollment = await engine.enrollUser(id, userId, triggerData)

    if (!enrollment) {
      throw badRequest("Failed to enroll user")
    }

    return createdResponse({ enrollment })
  } catch (error) {
    safeErrorLog('Failed to enroll user', error)
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      throw badRequest("User ID is required")
    }

    const enrollment = await engine.unenroll(id, userId)

    return successResponse({ enrollment })
  } catch (error) {
    safeErrorLog('Failed to unenroll user', error)
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId, action } = body

    if (!userId || !action) {
      throw badRequest("User ID and action are required")
    }

    let enrollment

    if (action === 'pause') {
      enrollment = await engine.pauseEnrollment(id, userId)
    } else if (action === 'resume') {
      enrollment = await engine.resumeEnrollment(id, userId)
    } else {
      throw badRequest("Invalid action. Use pause or resume")
    }

    return successResponse({ enrollment })
  } catch (error) {
    safeErrorLog('Failed to update enrollment', error)
    return handleApiError(error)
  }
}
