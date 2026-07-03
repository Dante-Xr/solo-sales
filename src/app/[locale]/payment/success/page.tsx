import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

async function PayPalSuccessHandler({
  token,
  locale
}: {
  token: string
  locale: string
}) {
  try {
    // 调用后端捕获 PayPal 支付
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/checkout/paypal/capture?token=${token}`, {
      cache: 'no-store'
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Payment capture failed')
    }

    return data.orderId
  } catch (error: unknown) {
    console.error('PayPal capture error:', error)
    throw error
  }
}

export default async function PaymentSuccessPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    session_id?: string
    order_id?: string
    token?: string // PayPal 返回参数
    provider?: string
  }>
}) {
  const { locale } = await params
  const search = await searchParams

  let orderId = search.order_id || search.session_id

  // 如果是 PayPal 支付回调
  if (search.provider === 'paypal' && search.token) {
    try {
      orderId = await PayPalSuccessHandler({
        token: search.token,
        locale
      })
    } catch (error: unknown) {
      // 如果捕获失败，重定向到失败页面
      redirect(`/${locale}/payment/failure?error=capture_failed`)
    }
  }

  if (!orderId) {
    redirect(`/${locale}`)
  }

  return (
    <div className="container max-w-2xl py-16">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 dark:bg-green-950 p-4">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">支付成功 / Payment Successful</h1>
          <p className="text-muted-foreground text-lg">
            您的订单已确认 / Your order has been confirmed
          </p>
        </div>

        {search.provider === 'paypal' && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              ✅ PayPal 支付已完成
            </p>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-6 space-y-2">
          <div className="text-sm text-muted-foreground">
            订单号 / Order Number
          </div>
          <div className="text-2xl font-mono font-bold">
            {orderId}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <a href={`/${locale}/account/orders`}>
            <Button size="lg">
              查看订单 / View Order
            </Button>
          </a>

          <a href={`/${locale}`}>
            <Button variant="outline" size="lg">
              继续购物 / Continue Shopping
            </Button>
          </a>
        </div>

        <div className="text-sm text-muted-foreground pt-4">
          确认邮件已发送至您的邮箱 / A confirmation email has been sent to your email address
        </div>
      </div>
    </div>
  )
}
