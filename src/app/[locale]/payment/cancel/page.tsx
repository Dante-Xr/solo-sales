import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function PaymentCancelPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    provider?: string
  }>
}) {
  const { locale } = await params
  const search = await searchParams

  return (
    <div className="container max-w-2xl py-16">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-yellow-100 dark:bg-yellow-950 p-4">
            <XCircle className="w-16 h-16 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">支付已取消 / Payment Cancelled</h1>
          <p className="text-muted-foreground text-lg">
            您已取消支付 / You have cancelled the payment
          </p>
        </div>

        {search.provider === 'paypal' && (
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ PayPal 支付已取消，您可以重新尝试支付
            </p>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-6 space-y-2">
          <p className="text-sm text-muted-foreground">
            如果您遇到问题或需要帮助，请联系客服
          </p>
          <p className="text-sm text-muted-foreground">
            If you encountered any issues or need help, please contact support
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <a href={`/${locale}/account/orders`}>
            <Button size="lg">
              查看订单 / View Orders
            </Button>
          </a>

          <a href={`/${locale}`}>
            <Button variant="outline" size="lg">
              返回首页 / Back to Home
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
