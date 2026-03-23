"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

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
  const { language } = useLanguage()
  const isZh = language === "zh"
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
      newErrors.name = isZh ? "请输入收货人姓名" : "Please enter recipient name"
    }

    // 验证手机号（中国大陆手机号格式）
    if (!formData.phone.trim()) {
      newErrors.phone = isZh ? "请输入联系电话" : "Please enter phone number"
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = isZh ? "请输入有效的手机号码" : "Please enter a valid phone number"
    }

    // 验证邮箱
    if (!formData.email.trim()) {
      newErrors.email = isZh ? "请输入邮箱" : "Please enter email"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = isZh ? "请输入有效的邮箱地址" : "Please enter a valid email address"
    }

    // 验证收货地址
    if (!formData.address.trim()) {
      newErrors.address = isZh ? "请输入收货地址" : "Please enter shipping address"
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
        <Label htmlFor="guest-name">{isZh ? "收货人姓名" : "Recipient Name"}</Label>
        <Input
          id="guest-name"
          type="text"
          placeholder={isZh ? "请输入收货人姓名" : "Enter recipient name"}
          value={formData.name}
          onChange={handleChange("name")}
          disabled={loading}
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
      </div>

      {/* 联系电话 */}
      <div className="space-y-2">
        <Label htmlFor="guest-phone">{isZh ? "联系电话" : "Phone Number"}</Label>
        <Input
          id="guest-phone"
          type="tel"
          placeholder={isZh ? "请输入手机号码" : "Enter phone number"}
          value={formData.phone}
          onChange={handleChange("phone")}
          disabled={loading}
        />
        {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
      </div>

      {/* 邮箱 */}
      <div className="space-y-2">
        <Label htmlFor="guest-email">{isZh ? "邮箱" : "Email"}</Label>
        <Input
          id="guest-email"
          type="email"
          placeholder={isZh ? "用于接收订单通知" : "For order notifications"}
          value={formData.email}
          onChange={handleChange("email")}
          disabled={loading}
        />
        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
      </div>

      {/* 收货地址 */}
      <div className="space-y-2">
        <Label htmlFor="guest-address">{isZh ? "收货地址" : "Shipping Address"}</Label>
        <Input
          id="guest-address"
          type="text"
          placeholder={isZh ? "省/市/区 + 详细地址" : "Province/City/District + Address"}
          value={formData.address}
          onChange={handleChange("address")}
          disabled={loading}
        />
        {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
      </div>

      {/* 提交按钮 */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {isZh ? "提交中..." : "Submitting..."}
          </>
        ) : (
          isZh ? "确认下单" : "Place Order"
        )}
      </Button>

      {/* 切换链接 */}
      <div className="flex justify-between text-sm text-gray-500">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-blue-600 hover:underline"
        >
          {isZh ? "已有账户？登录" : "Already have an account? Login"}
        </button>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-blue-600 hover:underline"
        >
          {isZh ? "注册新账户" : "Register new account"}
        </button>
      </div>
    </form>
  )
}
