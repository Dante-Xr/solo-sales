import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function PaymentSuccessPage({
  params,
  searchParams
}: {
  params: { locale: string }
  searchParams: { session_id?: string; order_id?: string }
}) {
  const orderId = searchParams.order_id || searchParams.session_id

  if (!orderId) {
    redirect(`/${params.locale}`)
  }

  return (
    <div className="container max-w-2xl py-16">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Payment Successful</h1>
          <p className="text-muted-foreground text-lg">
            Your order has been confirmed
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 space-y-2">
          <div className="text-sm text-muted-foreground">
            Order Number
          </div>
          <div className="text-2xl font-mono font-bold">
            {orderId}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <a href={`/${params.locale}/account/orders`}>
            <Button size="lg">
              View Order
            </Button>
          </a>

          <a href={`/${params.locale}`}>
            <Button variant="outline" size="lg">
              Continue Shopping
            </Button>
          </a>
        </div>

        <div className="text-sm text-muted-foreground pt-4">
          A confirmation email has been sent to your email address
        </div>
      </div>
    </div>
  )
}
