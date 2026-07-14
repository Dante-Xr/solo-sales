import { XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default async function PaymentFailurePage({
  params,
  searchParams
}: {
  params: { locale: string }
  searchParams: { reason?: string; order_id?: string }
}) {
  const reason = searchParams.reason || 'unknown'

  return (
    <div className="container max-w-2xl py-16">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Payment Failed</h1>
          <p className="text-muted-foreground text-lg">
            Your payment could not be processed
          </p>
        </div>

        {searchParams.order_id && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">
              Order Number
            </div>
            <div className="text-lg font-mono font-medium">
              {searchParams.order_id}
            </div>
          </div>
        )}

        <Alert variant="default" className="text-left">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {reason === 'cancelled'
              ? 'You cancelled the payment process'
              : 'The payment was declined. Please try again or use a different payment method.'
            }
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <a href={`/${params.locale}/cart`}>
            <Button size="lg">
              Retry Payment
            </Button>
          </a>

          <a href={`/${params.locale}`}>
            <Button variant="outline" size="lg">
              Back to Home
            </Button>
          </a>
        </div>

        <div className="text-sm text-muted-foreground pt-4">
          Need help? Contact our support team
        </div>
      </div>
    </div>
  )
}
