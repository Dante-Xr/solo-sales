/**
 * 修改时间：2026-05-02 19:27:31 +08:00
 * 修改内容：统一商品组合详情、更新和删除路由响应与错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import BundleService from "@/lib/bundle/BundleService"
import { safeErrorLog } from "@/lib/safeLog"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { notFound } from "@/server/contracts/errors"
import { requireAdminPermission } from "@/server/services/admin-service"

const bundleService = new BundleService(prisma)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(request, "bundles.view")

    const { id } = await params
    const bundle = await bundleService.getBundleById(id)

    if (!bundle) {
      throw notFound("商品组合")
    }

    return successResponse({ bundle })
  } catch (error: unknown) {
    safeErrorLog('Failed to get bundle', error)
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(request, "bundles.update")

    const { id } = await params
    const body = await request.json()

    const bundle = await bundleService.updateBundle(id, body)

    return successResponse({ bundle })
  } catch (error: unknown) {
    safeErrorLog('Failed to update bundle', error)
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(request, "bundles.update")

    const { id } = await params
    await bundleService.deleteBundle(id)

    return successResponse({ deleted: true })
  } catch (error: unknown) {
    safeErrorLog('Failed to delete bundle', error)
    return handleApiError(error)
  }
}
