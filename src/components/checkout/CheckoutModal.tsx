/**
 * 2026-03-23: 结账弹窗组件 CheckoutModal
 * 作用：作为前台商品页面的结账入口，收集买家联系信息并提供 Stripe/PayPal 两种支付选项
 * 逻辑：
 *   1. 接收父组件传入的 isOpen（显示状态）、onClose（关闭回调）、product（商品信息）
 *   2. 提供 Email 和收货地址表单（示意，正式项目需接入真实验收逻辑）
 *   3. 提供 Stripe 信用卡支付按钮，点击后 POST /api/checkout/stripe 并跳转至 Stripe 结账页
 *   4. 提供 PayPal 支付按钮，点击后 POST /api/checkout/paypal，模拟拉起 PayPal 弹窗
 */
"use client"

// 2026-03-23: 引入 React useState 钩子，用于管理两个支付按钮的加载状态
import { useState } from "react"
import { useCsrfToken } from "@/hooks/useCsrfToken"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// 2026-03-23: 定义组件 Props 接口，约束传入参数的类型
interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    name: string
    price: number
    id?: string
  }
}

/**
 * 2026-03-23: 结账弹窗主组件
 * @param isOpen - 控制弹窗是否显示
 * @param onClose - 关闭弹窗的回调函数
 * @param product - 当前待购买的商品信息（名称、价格、ID）
 */
export function CheckoutModal({ isOpen, onClose, product }: CheckoutModalProps) {
  const [loadingStripe, setLoadingStripe] = useState(false)
  const [loadingPayPal, setLoadingPayPal] = useState(false)
  const [paypalIsDemo, setPaypalIsDemo] = useState(false)
  const { csrfHeaders } = useCsrfToken()

  /**
   * 2026-03-23: Stripe 支付处理函数
   * 逻辑：
   *   1. 设置加载状态，防止重复提交
   *   2. 发送 POST 请求至 /api/checkout/stripe，携带商品信息
   *   3. 拿到 Stripe 生成的 session.url 后直接跳转至 Stripe 托管的结账页面
   *   4. 支付成功后 Stripe 会重定向至 success_url
   */
  const handleStripeCheckout = async () => {
    setLoadingStripe(true)
    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...csrfHeaders },
        body: JSON.stringify({
          productId: product.id || "mock-id",
          productName: product.name,
          price: product.price,
          quantity: 1,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingStripe(false)
    }
  }

  /**
   * 2026-03-23: PayPal 支付处理函数
   * 逻辑：
   *   1. 设置加载状态
   *   2. 发送 POST 请求至 /api/checkout/paypal，获取 PayPal Order ID
   *   3. 目前为 Mock 模式，仅弹出提示；正式项目需接入 @paypal/checkout-server-sdk 拉起真实弹窗
   */
  const handlePayPalCheckout = async () => {
    setLoadingPayPal(true)
    try {
      const res = await fetch("/api/checkout/paypal", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...csrfHeaders },
        body: JSON.stringify({
          price: product.price,
          quantity: 1,
        }),
      })
      const data = await res.json()
      if (data.orderId) {
        if (data.isDemo) {
          setPaypalIsDemo(true)
        }
        toast.success(`PayPal 订单已生成: ${data.orderId}`)
        onClose()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingPayPal(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>安全结账</DialogTitle>
          <DialogDescription>
            您正在购买 {product.name}，总计 ${product.price}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* 2026-03-23: 买家联系方式表单（示意） */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email 联系方式</Label>
            <Input id="email" type="email" placeholder="tiktokuser@example.com" />
          </div>
          {/* 2026-03-23: 买家收货地址表单（示意） */}
          <div className="grid gap-2">
            <Label htmlFor="address">收货地址</Label>
            <Input id="address" placeholder="您的详细地址" />
          </div>

          {/* 2026-03-23: 支付方式选择区：Stripe（信用卡）+ PayPal */}
          <div className="mt-4 flex flex-col gap-3">
            <Button
              className="w-full bg-[#635BFF] hover:bg-[#5851df] text-white"
              onClick={handleStripeCheckout}
              disabled={loadingStripe || loadingPayPal}
            >
              {loadingStripe ? "处理中..." : "使用 Stripe 信用卡支付"}
            </Button>

            <Button
              className="w-full bg-[#FFC439] hover:bg-[#eebb33] text-black"
              onClick={handlePayPalCheckout}
              disabled={loadingStripe || loadingPayPal}
            >
              {loadingPayPal ? "处理中..." : `使用 PayPal 支付${paypalIsDemo ? " (Demo)" : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
