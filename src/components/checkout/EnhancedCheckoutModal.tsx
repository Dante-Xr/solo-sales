"use client"

/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：下单请求不再提交客户端价格和总金额，并兼容统一 API 响应解包。
 * 修改模型：gpt-5.5
 */

// 2026-04-26: 移动端 Sheet 化 + CSS 变量类名替代硬编码颜色

import { useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useCsrfToken } from "@/hooks/useCsrfToken"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { AuthModal } from "@/components/auth/AuthModal"
import { GuestCheckoutData } from "@/components/auth/GuestCheckoutForm"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { useRouter } from "@/i18n/navigation"
import { useIsMobile } from "@/hooks/use-mobile"

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
// 移动端使用 Sheet（底部弹出），PC 端使用 Dialog（居中弹窗）
export function EnhancedCheckoutModal({
  isOpen,
  onClose,
  product,
  isCart = false,
  cartItems = [],
  cartTotal = 0,
}: EnhancedCheckoutModalProps) {
  const { data: session } = useSession()
  const t = useTranslations()
  const router = useRouter()
  const { csrfHeaders } = useCsrfToken()
  const isMobile = useIsMobile()  // 检测是否为移动端

  const [showAuthModal, setShowAuthModal] = useState(false)  // 是否显示认证弹窗
  const [authMode, setAuthMode] = useState<"login" | "register" | "guest">('login')  // 认证弹窗模式
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
  const _handleProceedToCheckout = () => {
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
        headers: { "Content-Type": "application/json", ...csrfHeaders },
        body: JSON.stringify({
          // 根据是购物车还是单品决定商品项
          items: isCart
            ? cartItems.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
              }))
            : [{ productId: product.id, quantity: 1 }],
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
        throw new Error(t('checkout.createOrderFailed'))
      }

      const responseData = await res.json()
      const order = responseData?.success ? responseData.data : responseData
      toast.success(t('checkout.orderCreated', { id: order.id }))
      onClose()
      router.push(`/orders/confirmation/${order.id}`)
    } catch {
      setError(t('checkout.orderCreationFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 已登录用户确认下单
  const handleAuthenticatedCheckout = async () => {
    // 验证收货信息完整性
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      setError(t('checkout.fillShippingInfo'))
      return
    }

    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...csrfHeaders },
        body: JSON.stringify({
          items: isCart
            ? cartItems.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
              }))
            : [{ productId: product.id, quantity: 1 }],
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
        throw new Error(t('checkout.createOrderFailed'))
      }

      const data = await res.json()
      const order = data?.success ? data.data : data
      toast.success(t('checkout.orderCreated', { id: order.id }))
      onClose()
      router.push(`/orders/confirmation/${order.id}`)
    } catch {
      setError(t('checkout.orderCreationFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 认证成功后的回调
  const _handleAuthSuccess = () => {
    setShowAuthModal(false)
  }

  // 已登录用户的结账表单
  const renderCheckoutForm = () => (
    <div className="space-y-4">
      {/* 订单摘要 */}
      <div className="bg-brand/5 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">
          {isCart ? t('checkout.cartItems') : t('checkout.product')}
        </p>
        <p className="font-medium line-clamp-2">
          {isCart
            ? t('checkout.totalItems', { count: cartItems.length })
            : product.name}
        </p>
        <p className="text-xl font-bold text-brand mt-2">
          ${totalAmount.toFixed(2)}
        </p>
      </div>

      {/* 收货信息表单 */}
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="checkout-name">{t('checkout.recipientName')}</Label>
          <Input
            id="checkout-name"
            placeholder={t('checkout.enterRecipientName')}
            value={shippingInfo.name}
            onChange={(e) =>
              setShippingInfo((prev) => ({ ...prev, name: e.target.value }))
            }
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkout-phone">{t('checkout.phoneNumber')}</Label>
          <Input
            id="checkout-phone"
            placeholder={t('checkout.enterPhone')}
            value={shippingInfo.phone}
            onChange={(e) =>
              setShippingInfo((prev) => ({ ...prev, phone: e.target.value }))
            }
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkout-address">{t('checkout.shippingAddress')}</Label>
          <Input
            id="checkout-address"
            placeholder={t('checkout.enterAddress')}
            value={shippingInfo.address}
            onChange={(e) =>
              setShippingInfo((prev) => ({ ...prev, address: e.target.value }))
            }
            disabled={loading}
          />
        </div>
      </div>

      {/* 错误提示 */}
      {error && <p className="text-destructive text-sm text-center">{error}</p>}

      {/* 操作按钮 */}
      <div className="space-y-2">
        <Button
          className="w-full bg-brand hover:bg-brand/90 text-brand-foreground"
          onClick={handleAuthenticatedCheckout}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('checkout.processing')}
            </>
          ) : (
            t('checkout.placeOrder')
          )}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAuthModal(true)}
          disabled={loading}
        >
          {t('checkout.loginRegister')}
        </Button>
      </div>
    </div>
  )

  // 未登录用户的选项
  const renderGuestOptions = () => (
    <div className="space-y-4">
      {/* 订单金额展示 */}
      <div className="bg-brand/5 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">{t('checkout.orderTotal')}</p>
        <p className="text-xl font-bold text-brand">
          ${totalAmount.toFixed(2)}
        </p>
      </div>

      {/* 登录按钮 */}
      <Button
        className="w-full bg-brand hover:bg-brand/90 text-brand-foreground"
        onClick={() => {
          setAuthMode('login')
          setShowAuthModal(true)
        }}
      >
        {t('auth.login')}
      </Button>

      {/* 分隔线 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{t('common.or')}</span>
        </div>
      </div>

      {/* 访客结账按钮 */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setAuthMode('guest')
          setShowAuthModal(true)
        }}
      >
        {t('checkout.guestCheckout')}
      </Button>

      {/* 注册链接 */}
      <Button
        variant="ghost"
        className="w-full"
        onClick={() => {
          setAuthMode('register')
          setShowAuthModal(true)
        }}
      >
        {t('auth.register')}
      </Button>
    </div>
  )

  // 弹窗主体内容（Dialog 和 Sheet 共用）
  const modalContent = session ? renderCheckoutForm() : renderGuestOptions()

  // 弹窗标题区域
  const modalTitle = t('checkout.confirmOrder')
  const modalDescription = session
    ? t('checkout.fillShippingInfo')
    : t('checkout.loginOrGuest')

  return (
    <>
      {/* PC 端：居中 Dialog 弹窗 */}
      {!isMobile && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{modalTitle}</DialogTitle>
              <DialogDescription>{modalDescription}</DialogDescription>
            </DialogHeader>
            {modalContent}
          </DialogContent>
        </Dialog>
      )}

      {/* 移动端：底部 Sheet 弹出 */}
      {isMobile && (
        <Sheet open={isOpen} onOpenChange={onClose}>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold">{modalTitle}</SheetTitle>
              <SheetDescription>{modalDescription}</SheetDescription>
            </SheetHeader>
            {modalContent}
          </SheetContent>
        </Sheet>
      )}

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
