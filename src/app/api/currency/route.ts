import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import CurrencyService from '@/lib/currency/CurrencyService'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    const currencyService = new CurrencyService(prisma)

    switch (action) {
      case 'rates': {
        const base = searchParams.get('base') || 'USD'
        const rates = await currencyService.getExchangeRates(base)
        return NextResponse.json({
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
          return NextResponse.json(
            { error: 'Invalid amount' },
            { status: 400 }
          )
        }

        const converted = await currencyService.convertPrice(amount, from, to)
        return NextResponse.json(converted)
      }

      default: {
        const currencies = await currencyService.getSupportedCurrencies()
        const defaultCurrency = await currencyService.getDefaultCurrency()

        return NextResponse.json({
          currencies,
          default: defaultCurrency,
          timestamp: new Date().toISOString()
        })
      }
    }
  } catch (error) {
    console.error('Currency API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}