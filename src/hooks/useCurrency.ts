'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CurrencyCode,
  SUPPORTED_CURRENCIES,
  CURRENCY_SYMBOLS
} from '@/lib/currency/types'

interface CurrencyState {
  currency: CurrencyCode
  rates: Record<string, number>
  isLoading: boolean
}

const STORAGE_KEY = 'solo_currency'

export function useCurrency() {
  const [state, setState] = useState<CurrencyState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const { currency } = JSON.parse(saved) as { currency: CurrencyCode }
          if (SUPPORTED_CURRENCIES.includes(currency)) {
            return { currency, rates: { USD: 1 }, isLoading: false }
          }
        }
      } catch (error) {
        console.error('Failed to load currency preference:', error)
      }
    }
    return { currency: 'USD' as CurrencyCode, rates: { USD: 1 }, isLoading: true }
  })

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch(`/api/currency?action=rates&base=USD`)
        if (res.ok) {
          const data = await res.json()
          setState(prev => ({ ...prev, rates: data.rates || { USD: 1 } }))
        }
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error)
      }
    }

    fetchRates()
    const interval = setInterval(fetchRates, 3600000)
    return () => clearInterval(interval)
  }, [])

  const setCurrency = useCallback((currency: CurrencyCode) => {
    if (!SUPPORTED_CURRENCIES.includes(currency)) return

    setState(prev => ({ ...prev, currency }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currency }))
  }, [])

  const convert = useCallback((amount: number, from?: string): number => {
    if (from && from !== state.currency) {
      const rate = state.rates[from] || 1
      const targetRate = state.rates[state.currency] || 1
      return amount * (targetRate / rate)
    }
    if (from === state.currency) return amount
    const rate = state.rates[state.currency] || 1
    return amount * rate
  }, [state.currency, state.rates])

  const format = useCallback((amount: number, currency?: string): string => {
    const curr = currency || state.currency
    const symbol = CURRENCY_SYMBOLS[curr as CurrencyCode] || curr
    const decimals = curr === 'JPY' ? 0 : 2
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`
  }, [state.currency])

  const convertAndFormat = useCallback((amount: number, from?: string): string => {
    const converted = convert(amount, from)
    return format(converted)
  }, [convert, format])

  return {
    currency: state.currency,
    currencies: SUPPORTED_CURRENCIES,
    rates: state.rates,
    isLoading: state.isLoading,
    setCurrency,
    convert,
    format,
    convertAndFormat
  }
}