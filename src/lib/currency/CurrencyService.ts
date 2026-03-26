import { PrismaClient } from '@prisma/client'
import { cacheGet, cacheSet, cacheDel } from '../cache'
import {
  CurrencyInfo,
  ConvertedPrice,
  CurrencyCode,
  SUPPORTED_CURRENCIES,
  DEFAULT_CURRENCY,
  CURRENCY_SYMBOLS
} from './types'

const CACHE_TTL = 3600
const RATES_CACHE_KEY = 'solo:currency:rates'

class CurrencyService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async getSupportedCurrencies(): Promise<CurrencyInfo[]> {
    const cacheKey = `${RATES_CACHE_KEY}:supported`
    const cached = await cacheGet<CurrencyInfo[]>(cacheKey)

    if (cached) {
      return cached
    }

    const currencies = await this.prisma.currency.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' }
    })

    const result: CurrencyInfo[] = currencies.map(c => ({
      code: c.code,
      name: c.name,
      symbol: c.symbol,
      decimals: c.decimals,
      isDefault: c.isDefault,
      isActive: c.isActive
    }))

    await cacheSet(cacheKey, JSON.stringify(result), 300)
    return result
  }

  async getDefaultCurrency(): Promise<CurrencyInfo | null> {
    const currencies = await this.prisma.currency.findMany({
      where: { isDefault: true, isActive: true }
    })

    if (currencies.length === 0) {
      return {
        code: DEFAULT_CURRENCY,
        name: 'US Dollar',
        symbol: CURRENCY_SYMBOLS[DEFAULT_CURRENCY as CurrencyCode],
        decimals: 2,
        isDefault: true,
        isActive: true
      }
    }

    return {
      code: currencies[0].code,
      name: currencies[0].name,
      symbol: currencies[0].symbol,
      decimals: currencies[0].decimals,
      isDefault: currencies[0].isDefault,
      isActive: currencies[0].isActive
    }
  }

  async getExchangeRates(baseCurrency: string = 'USD'): Promise<Record<string, number>> {
    const cacheKey = `${RATES_CACHE_KEY}:${baseCurrency}`
    const cached = await cacheGet<Record<string, number>>(cacheKey)

    if (cached) {
      return cached
    }

    const rates = await this.prisma.exchangeRate.findMany({
      where: {
        baseCurrency,
        expiresAt: { gt: new Date() }
      }
    })

    const result: Record<string, number> = { [baseCurrency]: 1 }

    for (const rate of rates) {
      result[rate.targetCurrency] = Number(rate.rate)
    }

    for (const currency of SUPPORTED_CURRENCIES) {
      if (!result[currency]) {
        result[currency] = await this.calculateCrossRate(baseCurrency, currency)
      }
    }

    await cacheSet(cacheKey, JSON.stringify(result), CACHE_TTL)
    return result
  }

  private async calculateCrossRate(from: string, to: string): Promise<number> {
    if (from === to) return 1

    const fromRates = await this.prisma.exchangeRate.findMany({
      where: {
        baseCurrency: from,
        expiresAt: { gt: new Date() }
      }
    })

    const toRates = await this.prisma.exchangeRate.findMany({
      where: {
        baseCurrency: to,
        expiresAt: { gt: new Date() }
      }
    })

    if (from === 'USD' && toRates.length > 0) {
      return 1 / Number(toRates[0].rate)
    }

    if (to === 'USD' && fromRates.length > 0) {
      return Number(fromRates[0].rate)
    }

    const fromToUSD = fromRates.length > 0 ? Number(fromRates[0].rate) : 1
    const toToUSD = toRates.length > 0 ? Number(toRates[0].rate) : 1

    return fromToUSD / toToUSD
  }

  async convertPrice(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<ConvertedPrice> {
    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: amount,
        displayCurrency: toCurrency,
        exchangeRate: 1,
        formatted: this.formatAmount(amount, toCurrency)
      }
    }

    const rates = await this.getExchangeRates(fromCurrency)
    const rate = rates[toCurrency] || 1
    const convertedAmount = amount * rate

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount: Number(convertedAmount.toFixed(2)),
      displayCurrency: toCurrency,
      exchangeRate: rate,
      formatted: this.formatAmount(convertedAmount, toCurrency)
    }
  }

  formatAmount(amount: number, currency: string): string {
    const symbol = CURRENCY_SYMBOLS[currency as CurrencyCode] || currency
    const decimals = currency === 'JPY' ? 0 : 2
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
    return `${symbol}${formatted}`
  }

  async updateExchangeRates(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
      )

      if (!response.ok) {
        console.error('Failed to fetch exchange rates')
        return false
      }

      const data = await response.json()

      if (data.result !== 'success') {
        console.error('Exchange rate API error:', data.error)
        return false
      }

      const expiresAt = new Date(Date.now() + CACHE_TTL * 1000)

      for (const [currency, rate] of Object.entries(data.conversion_rates)) {
        if (SUPPORTED_CURRENCIES.includes(currency as CurrencyCode) && currency !== 'USD') {
          await this.prisma.exchangeRate.upsert({
            where: {
              baseCurrency_targetCurrency: {
                baseCurrency: 'USD',
                targetCurrency: currency
              }
            },
            update: {
              rate: Number(rate),
              fetchedAt: new Date(),
              expiresAt,
              source: 'exchangerate-api.com'
            },
            create: {
              baseCurrency: 'USD',
              targetCurrency: currency,
              rate: Number(rate),
              fetchedAt: new Date(),
              expiresAt,
              source: 'exchangerate-api.com'
            }
          })
        }
      }

      await cacheDel(`${RATES_CACHE_KEY}:USD`)

      return true
    } catch (error) {
      console.error('Failed to update exchange rates:', error)
      return false
    }
  }

  async initializeDefaultCurrencies(): Promise<void> {
    const defaultCurrencies: Array<{
      code: string
      name: string
      symbol: string
      decimals: number
      isDefault: boolean
    }> = [
      { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, isDefault: true },
      { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, isDefault: false },
      { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2, isDefault: false },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0, isDefault: false }
    ]

    for (const currency of defaultCurrencies) {
      await this.prisma.currency.upsert({
        where: { code: currency.code },
        update: {
          name: currency.name,
          symbol: currency.symbol,
          decimals: currency.decimals,
          isDefault: currency.isDefault
        },
        create: currency
      })
    }
  }
}

export default CurrencyService