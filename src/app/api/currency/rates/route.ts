import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import CurrencyService from '@/lib/currency/CurrencyService'
import { safeErrorLog } from '@/lib/safeLog'

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-exchange-api-key')

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      )
    }

    const currencyService = new CurrencyService(prisma)
    const success = await currencyService.updateExchangeRates(apiKey)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update exchange rates' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Exchange rates updated successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    safeErrorLog('Currency rates refresh error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}