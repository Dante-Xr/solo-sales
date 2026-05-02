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
import { serviceUnavailable, unauthorized } from "@/server/contracts/errors"

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-exchange-api-key')

    if (!apiKey) {
      throw unauthorized("API key required")
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
