/**
 * 修改时间：2026-05-02 19:21:48 +08:00
 * 修改内容：统一邮件序列详情、更新和删除路由响应与错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import EmailSequenceEngine from "@/lib/marketing/EmailSequenceEngine"
import { safeErrorLog } from "@/lib/safeLog"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { notFound } from "@/server/contracts/errors"

const engine = new EmailSequenceEngine(prisma)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sequence = await engine.getSequenceById(id)

    if (!sequence) {
      throw notFound("邮件序列")
    }

    const stats = await engine.getEnrollmentStats(id)

    return successResponse({ sequence, stats })
  } catch (error) {
    safeErrorLog('Failed to get sequence', error)
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const sequence = await engine.updateSequence(id, body)

    return successResponse({ sequence })
  } catch (error) {
    safeErrorLog('Failed to update sequence', error)
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await engine.deleteSequence(id)

    return successResponse({ deleted: true })
  } catch (error) {
    safeErrorLog('Failed to delete sequence', error)
    return handleApiError(error)
  }
}
