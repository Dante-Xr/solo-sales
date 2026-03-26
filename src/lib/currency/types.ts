export interface CurrencyInfo {
  code: string
  name: string
  symbol: string
  decimals: number
  isDefault: boolean
  isActive: boolean
}

export interface ExchangeRateInfo {
  baseCurrency: string
  targetCurrency: string
  rate: number
  fetchedAt: Date
  expiresAt: Date
  source: string
}

export interface ConvertedPrice {
  originalAmount: number
  originalCurrency: string
  convertedAmount: number
  displayCurrency: string
  exchangeRate: number
  formatted: string
}

export interface CurrencyConfig {
  defaultCurrency: string
  supportedCurrencies: string[]
  exchangeRateApi: string
  cacheDuration: number
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY'

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'JPY']

export const DEFAULT_CURRENCY: CurrencyCode = 'USD'

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥'
}

export const CURRENCY_NAMES: Record<CurrencyCode, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen'
}