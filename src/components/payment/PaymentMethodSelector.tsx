/**
 * ============================================
 * Payment Method Selector Component
 * ============================================
 * 创建时间：2026-06-28 01:00:00 +08:00
 * 创建依据：v1.7规范 - 支付方式选择
 * 功能说明：
 *   - 支持Stripe/Alipay/WeChat选择
 *   - 使用shadcn/ui RadioGroup
 *   - 显示支付方式图标和说明
 * ============================================
 */

'use client'

import { useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { CreditCard, Smartphone } from 'lucide-react'

export type PaymentMethod = 'stripe' | 'alipay' | 'wechatpay'

interface PaymentMethodSelectorProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
  disabled?: boolean
}

const paymentMethods = [
  {
    id: 'stripe' as const,
    name: 'Credit Card',
    description: 'Pay with Visa, Mastercard, or Amex',
    icon: CreditCard
  },
  {
    id: 'alipay' as const,
    name: 'Alipay',
    description: '支付宝支付',
    icon: Smartphone
  },
  {
    id: 'wechatpay' as const,
    name: 'WeChat Pay',
    description: '微信支付',
    icon: Smartphone
  }
]

export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Select Payment Method</h3>
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as PaymentMethod)}
        disabled={disabled}
        className="space-y-2"
      >
        {paymentMethods.map((method) => {
          const Icon = method.icon
          return (
            <Card
              key={method.id}
              className={`relative flex items-center space-x-3 p-4 cursor-pointer transition-colors ${
                value === method.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-muted-foreground/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && onChange(method.id)}
            >
              <RadioGroupItem value={method.id} id={method.id} />
              <Icon className="h-5 w-5 text-muted-foreground" />
              <Label
                htmlFor={method.id}
                className="flex-1 cursor-pointer"
              >
                <div className="font-medium">{method.name}</div>
                <div className="text-sm text-muted-foreground">
                  {method.description}
                </div>
              </Label>
            </Card>
          )
        })}
      </RadioGroup>
    </div>
  )
}
