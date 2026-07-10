'use client'

import { useCurrency } from '@/hooks/useCurrency'
import { CurrencyCode, CURRENCY_SYMBOLS } from '@/lib/currency/types'

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: CurrencyCode) => void
  className?: string
}

export function CurrencySelector({ onCurrencyChange, className = '' }: CurrencySelectorProps) {
  const { currency, currencies, setCurrency } = useCurrency()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value as CurrencyCode
    setCurrency(newCurrency)
    onCurrencyChange?.(newCurrency)
  }

  return (
    <select
      value={currency}
      onChange={handleChange}
      className={`px-3 py-1.5 border border-border rounded-md text-sm bg-input text-foreground hover:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${className}`}
    >
      {currencies.map((curr) => (
        <option key={curr} value={curr}>
          {CURRENCY_SYMBOLS[curr]} {curr}
        </option>
      ))}
    </select>
  )
}

interface PriceDisplayProps {
  amount: number
  originalCurrency?: string
  showOriginal?: boolean
  className?: string
}

export function PriceDisplay({
  amount,
  originalCurrency,
  showOriginal = false,
  className = ''
}: PriceDisplayProps) {
  const { convertAndFormat, currency } = useCurrency()

  const displayPrice = convertAndFormat(amount, originalCurrency)
  const originalPrice = originalCurrency ? `${CURRENCY_SYMBOLS[originalCurrency as keyof typeof CURRENCY_SYMBOLS] || originalCurrency}${amount.toFixed(2)}` : null

  if (showOriginal && originalPrice && originalCurrency !== currency) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-muted-foreground line-through text-sm">{originalPrice}</span>
        <span className="font-semibold text-lg">{displayPrice}</span>
      </div>
    )
  }

  return (
    <span className={`font-semibold text-lg ${className}`}>
      {displayPrice}
    </span>
  )
}

interface CurrencyBadgeProps {
  currency: CurrencyCode
  className?: string
}

export function CurrencyBadge({ currency, className = '' }: CurrencyBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-foreground ${className}`}>
      {CURRENCY_SYMBOLS[currency]} {currency}
    </span>
  )
}
