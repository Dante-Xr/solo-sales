/**
 * 修改时间：2026-05-02 19:16:38 +08:00
 * 修改内容：统一汇率刷新路由响应和错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import CurrencyService from "@/lib/currency/CurrencyService"
import { safeErrorLog } from "@/lib/safeLog"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { serviceUnavailable } from "@/server/contracts/errors"
import { requireAdminPermission } from "@/server/services/admin-service"

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "currency.update")

    const apiKey = process.env.EXCHANGE_RATE_API_KEY
    if (!apiKey) {
      throw serviceUnavailable("Exchange rate API key is not configured")
    }

    const currencyService = new CurrencyService(prisma)
    const success = await currencyService.updateExchangeRates(apiKey)

    if (!success) {
      throw serviceUnavailable("Failed to update exchange rates")
    }

    // 返回刷新时间，方便调用方判断缓存中的汇率是否已经更新。
    return successResponse({
      message: 'Exchange rates updated successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    safeErrorLog('Currency rates refresh error', error)
    return handleApiError(error)
  }
}
