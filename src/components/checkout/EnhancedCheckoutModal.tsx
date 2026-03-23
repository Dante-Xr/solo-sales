"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { AuthModal } from "@/components/auth/AuthModal"
import { GuestCheckoutData } from "@/components/auth/GuestCheckoutForm"
import { useLanguage } from "@/context/LanguageContext"

// 增强版结账弹窗 Props 接口
interface EnhancedCheckoutModalProps {
  isOpen: boolean      // 弹窗是否打开
  onClose: () => void  // 关闭弹窗回调
  product: {
    name: string       // 商品名称
    price: number       // 商品价格
    id?: string        // 商品 ID
  }
  isCart?: boolean     // 是否为购物车结算
  cartItems?: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  cartTotal?: number   // 购物车总价
}

// 收货信息接口
interface ShippingInfo {
  name: string
  phone: string
  email: string
  address: string
}

// 增强版结账弹窗组件
// 功能：双重结账路径（登录用户/访客）、收货信息填写、订单创建
export function EnhancedCheckoutModal({
  isOpen,
  onClose,
  product,
  isCart = false,
  cartItems = [],
  cartTotal = 0,
}: EnhancedCheckoutModalProps) {
  const { data: session } = useSession()   // 当前用户 session
  const { language } = useLanguage()
  const isZh = language === "zh"
  const [showAuthModal, setShowAuthModal] = useState(false)  // 是否显示认证弹窗
  const [authMode, setAuthMode] = useState<"login" | "register" | "guest">("login")  // 认证弹窗模式
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({  // 收货信息
    name: "",
    phone: "",
    email: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)   // 加载状态
  const [error, setError] = useState("")          // 错误信息

  // 计算总金额：购物车模式用 cartTotal，否则用单个商品价格
  const totalAmount = isCart ? cartTotal : product.price

  // 处理继续结账流程
  // 未登录用户先弹出认证弹窗
  const handleProceedToCheckout = () => {
    if (!session) {
      setShowAuthModal(true)
      return
    }
  }

  // 访客结账提交
  const handleGuestCheckout = async (data: GuestCheckoutData) => {
    setLoading(true)
    setError("")
    try {
      // 调用订单 API 创建订单
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 根据是购物车还是单品决定商品项
          items: isCart
            ? cartItems.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
              }))
            : [{ productId: product.id, quantity: 1, price: product.price }],
          totalAmount,
          shippingAddress: data.address,
          contactInfo: {
            name: data.name,
            phone: data.phone,
            email: data.email,
          },
          isGuest: true,  // 标记为访客订单
        }),
      })

      if (!res.ok) {
        throw new Error(isZh ? "创建订单失败" : "Failed to create order")
      }

      const order = await res.json()
      alert(isZh ? `订单创建成功！订单号: ${order.id}` : `Order created! Order ID: ${order.id}`)
      onClose()
    } catch (err) {
      setError(isZh ? "订单创建失败，请稍后重试" : "Order creation failed, please try again")
    } finally {
      setLoading(false)
    }
  }

  // 已登录用户确认下单
  const handleAuthenticatedCheckout = async () => {
    // 验证收货信息完整性
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      setError(isZh ? "请填写完整的收货信息" : "Please fill in all shipping info")
      return
    }

    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: isCart
            ? cartItems.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
              }))
            : [{ productId: product.id, quantity: 1, price: product.price }],
          totalAmount,
          shippingAddress: shippingInfo.address,
          contactInfo: {
            name: shippingInfo.name,
            phone: shippingInfo.phone,
            email: session?.user?.email || shippingInfo.email,
          },
          isGuest: false,
        }),
      })

      if (!res.ok) {
        throw new Error(isZh ? "创建订单失败" : "Failed to create order")
      }

      const order = await res.json()
      alert(isZh ? `订单创建成功！订单号: ${order.id}` : `Order created! Order ID: ${order.id}`)
      onClose()
    } catch (err) {
      setError(isZh ? "订单创建失败，请稍后重试" : "Order creation failed, please try again")
    } finally {
      setLoading(false)
    }
  }

  // 认证成功后的回调
  const handleAuthSuccess = () => {
    setShowAuthModal(false)
  }

  // 已登录用户的结账表单
  const renderCheckoutForm = () => (
    <div className="space-y-4">
      {/* 订单摘要 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-500 mb-1">
          {isCart ? (isZh ? "购物车商品" : "Cart Items") : (isZh ? "商品" : "Product")}
        </p>
        <p className="font-medium line-clamp-2">
          {isCart
            ? `${isZh ? "共" : "Total"} ${cartItems.length} ${isZh ? "件商品" : "items"}`
            : product.name}
        </p>
        <p className="text-xl font-bold text-red-600 mt-2">
          ${totalAmount.toFixed(2)}
        </p>
      </div>

      {/* 收货信息表单 */}
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="checkout-name">{isZh ? "收货人姓名" : "Recipient Name"}</Label>
          <Input
            id="checkout-name"
            placeholder={isZh ? "请输入收货人姓名" : "Enter recipient name"}
            value={shippingInfo.name}
            onChange={(e) =>
              setShippingInfo((prev) => ({ ...prev, name: e.target.value }))
            }
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkout-phone">{isZh ? "联系电话" : "Phone Number"}</Label>
          <Input
            id="checkout-phone"
            placeholder={isZh ? "请输入手机号码" : "Enter phone number"}
            value={shippingInfo.phone}
            onChange={(e) =>
              setShippingInfo((prev) => ({ ...prev, phone: e.target.value }))
            }
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkout-address">{isZh ? "收货地址" : "Shipping Address"}</Label>
          <Input
            id="checkout-address"
            placeholder={isZh ? "省/市/区 + 详细地址" : "Province/City/District + Address"}
            value={shippingInfo.address}
            onChange={(e) =>
              setShippingInfo((prev) => ({ ...prev, address: e.target.value }))
            }
            disabled={loading}
          />
        </div>
      </div>

      {/* 错误提示 */}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {/* 操作按钮 */}
      <div className="space-y-2">
        <Button
          className="w-full bg-[#635BFF] hover:bg-[#5851df] text-white"
          onClick={handleAuthenticatedCheckout}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isZh ? "处理中..." : "Processing..."}
            </>
          ) : (
            isZh ? "确认下单" : "Place Order"
          )}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAuthModal(true)}
          disabled={loading}
        >
          {isZh ? "登录账户 / 注册账户" : "Login / Register"}
        </Button>
      </div>
    </div>
  )

  // 未登录用户的选项
  const renderGuestOptions = () => (
    <div className="space-y-4">
      {/* 订单金额展示 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-500 mb-1">{isZh ? "订单金额" : "Order Total"}</p>
        <p className="text-xl font-bold text-red-600">
          ${totalAmount.toFixed(2)}
        </p>
      </div>

      {/* 登录按钮 */}
      <Button
        className="w-full bg-[#635BFF] hover:bg-[#5851df] text-white"
        onClick={() => {
          setAuthMode("login")
          setShowAuthModal(true)
        }}
      >
        {isZh ? "登录账户" : "Login"}
      </Button>

      {/* 分隔线 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">{isZh ? "或" : "or"}</span>
        </div>
      </div>

      {/* 访客结账按钮 */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setAuthMode("guest")
          setShowAuthModal(true)
        }}
      >
        {isZh ? "访客结账" : "Guest Checkout"}
      </Button>

      {/* 注册链接 */}
      <Button
        variant="ghost"
        className="w-full"
        onClick={() => {
          setAuthMode("register")
          setShowAuthModal(true)
        }}
      >
        {isZh ? "注册新账户" : "Register"}
      </Button>
    </div>
  )

  return (
    <>
      {/* 主结账弹窗 */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{isZh ? "确认订单" : "Confirm Order"}</DialogTitle>
            <DialogDescription>
              {session ? (isZh ? "请填写收货信息" : "Please fill in shipping info") : (isZh ? "登录账户或以访客身份结账" : "Login or checkout as guest")}
            </DialogDescription>
          </DialogHeader>

          {/* 根据是否登录显示不同内容 */}
          {session ? renderCheckoutForm() : renderGuestOptions()}
        </DialogContent>
      </Dialog>

      {/* 认证弹窗 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onGuestCheckout={handleGuestCheckout}
      />
    </>
  )
}
