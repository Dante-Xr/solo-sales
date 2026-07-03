/**
 * 修改时间：2026-05-02 19:16:38 +08:00
 * 修改内容：统一货币查询与换算路由响应和错误处理，清理手写 NextResponse 模板。
 * 修改模型：gpt-5.5
 */
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import CurrencyService from "@/lib/currency/CurrencyService"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { badRequest } from "@/server/contracts/errors"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    const currencyService = new CurrencyService(prisma)

    switch (action) {
      case 'rates': {
        const base = searchParams.get('base') || 'USD'
        const rates = await currencyService.getExchangeRates(base)
        return successResponse({
          base,
          rates,
          timestamp: new Date().toISOString()
        })
      }

      case 'convert': {
        const amount = parseFloat(searchParams.get('amount') || '0')
        const from = searchParams.get('from') || 'USD'
        const to = searchParams.get('to') || 'USD'

        if (amount <= 0) {
          throw badRequest("Invalid amount")
        }

        const converted = await currencyService.convertPrice(amount, from, to)
        return successResponse(converted)
      }

      default: {
        const currencies = await currencyService.getSupportedCurrencies()
        const defaultCurrency = await currencyService.getDefaultCurrency()

        return successResponse({
          currencies,
          default: defaultCurrency,
          timestamp: new Date().toISOString()
        })
      }
    }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
