/**
 * ============================================
 * 访客结账表单组件 (Phase 4 国际化升级)
 * ============================================
 * 2026-04-13: 更新为使用 next-intl 国际化
 * 功能说明：
 *   - 访客结账表单
 *   - 表单验证
 *   - 使用 next-intl 进行国际化
 * ============================================
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

// 访客结账表单 Props 接口
interface GuestCheckoutFormProps {
  onSubmit: (data: GuestCheckoutData) => Promise<void>  // 提交回调
  onSwitchToLogin?: () => void       // 切换到登录
  onSwitchToRegister?: () => void    // 切换到注册
}

// 访客结账数据接口
export interface GuestCheckoutData {
  name: string      // 收货人姓名
  phone: string     // 联系电话
  email: string     // 邮箱
  address: string   // 收货地址
}

// 访客结账表单组件
export function GuestCheckoutForm({ onSubmit, onSwitchToLogin, onSwitchToRegister }: GuestCheckoutFormProps) {
  const t = useTranslations()
  const [formData, setFormData] = useState<GuestCheckoutData>({
    name: "",
    phone: "",
    email: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)     // 加载状态
  const [errors, setErrors] = useState<Partial<GuestCheckoutData>>({})  // 表单错误

  // 表单验证
  const validateForm = () => {
    const newErrors: Partial<GuestCheckoutData> = {}

    // 验证收货人姓名
    if (!formData.name.trim()) {
      newErrors.name = t('checkout.nameRequired')
    }

    // 验证手机号（中国大陆手机号格式）
    if (!formData.phone.trim()) {
      newErrors.phone = t('checkout.phoneRequired')
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = t('checkout.phoneInvalid')
    }

    // 验证邮箱
    if (!formData.email.trim()) {
      newErrors.email = t('auth.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('checkout.emailInvalid')
    }

    // 验证收货地址
    if (!formData.address.trim()) {
      newErrors.address = t('checkout.addressRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  // 处理输入变化，同时清除该字段的错误
  const handleChange = (field: keyof GuestCheckoutData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 收货人姓名 */}
      <div className="space-y-2">
        <Label htmlFor="guest-name">{t('checkout.contactName')}</Label>
        <Input
          id="guest-name"
          type="text"
          placeholder={t('checkout.contactName')}
          value={formData.name}
          onChange={handleChange('name')}
          disabled={loading}
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
      </div>

      {/* 联系电话 */}
      <div className="space-y-2">
        <Label htmlFor="guest-phone">{t('checkout.contactPhone')}</Label>
        <Input
          id="guest-phone"
          type="tel"
          placeholder={t('checkout.contactPhone')}
          value={formData.phone}
          onChange={handleChange('phone')}
          disabled={loading}
        />
        {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
      </div>

      {/* 邮箱 */}
      <div className="space-y-2">
        <Label htmlFor="guest-email">{t('checkout.contactEmail')}</Label>
        <Input
          id="guest-email"
          type="email"
          placeholder={t('checkout.contactEmail')}
          value={formData.email}
          onChange={handleChange('email')}
          disabled={loading}
        />
        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
      </div>

      {/* 收货地址 */}
      <div className="space-y-2">
        <Label htmlFor="guest-address">{t('checkout.addressDetail')}</Label>
        <Input
          id="guest-address"
          type="text"
          placeholder={t('checkout.addressDetail')}
          value={formData.address}
          onChange={handleChange('address')}
          disabled={loading}
        />
        {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
      </div>

      {/* 提交按钮 */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t('common.loading')}
          </>
        ) : (
          t('checkout.placeOrder')
        )}
      </Button>

      {/* 切换链接 */}
      <div className="flex justify-between text-sm text-gray-500">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-blue-600 hover:underline"
        >
          {t('auth.hasAccount')} {t('auth.login')}
        </button>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-blue-600 hover:underline"
        >
          {t('auth.register')}
        </button>
      </div>
    </form>
  )
}
