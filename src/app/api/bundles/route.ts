/**
 * 修改时间：2026-05-02 19:27:31 +08:00
 * 修改内容：统一商品组合列表和创建路由响应与错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import BundleService from "@/lib/bundle/BundleService"
import { BundleStatus } from "@prisma/client"
import { safeErrorLog } from "@/lib/safeLog"
import { createdResponse, handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest, notFound } from "@/server/contracts/errors"

const bundleService = new BundleService(prisma)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as BundleStatus | null
    const slug = searchParams.get('slug')
    const includeExpired = searchParams.get('includeExpired') === 'true'

    if (slug) {
      const bundle = await bundleService.getBundleBySlug(slug)
      if (!bundle) {
        throw notFound("商品组合")
      }
      return successResponse({ bundle })
    }

    const bundles = await bundleService.getBundles({
      status: status || undefined,
      includeExpired
    })

    return successResponse({ bundles })
  } catch (error) {
    safeErrorLog('Failed to get bundles', error)
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name,
      description,
      slug,
      discountType,
      discountValue,
      startDate,
      endDate,
      maxUsage,
      minItems,
      maxItems,
      isStackable,
      items
    } = body

    if (!name || !slug || !discountType || discountValue === undefined || !items) {
      throw badRequest("Missing required fields")
    }

    // BundleService 负责校验折扣类型、时间窗口和明细项业务规则，route 只挡住必填字段。
    const bundle = await bundleService.createBundle({
      name,
      description,
      slug,
      discountType,
      discountValue,
      startDate,
      endDate,
      maxUsage,
      minItems,
      maxItems,
      isStackable,
      items
    })

    return createdResponse({ bundle })
  } catch (error) {
    safeErrorLog('Failed to create bundle', error)
    return handleApiError(error)
  }
}
