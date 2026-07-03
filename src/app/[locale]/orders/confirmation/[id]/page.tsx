import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { CheckCircle, Package, Truck, Calendar } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { getServerSessionUser } from "@/server/auth/session"
import { AppError } from "@/server/contracts/errors"
import { getOrderByIdForViewer } from "@/server/services/order-service"

interface ConfirmationPageProps {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: ConfirmationPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "checkout" })
  return {
    title: t("orderConfirmed"),
  }
}

export default async function OrderConfirmationPage({ params }: ConfirmationPageProps) {
  const { id } = await params
  const t = await getTranslations("checkout")

  let order
  try {
    const sessionUser = await getServerSessionUser()
    order = await getOrderByIdForViewer(id, sessionUser)
  } catch (error: unknown) {
    if (error instanceof AppError && [401, 403, 404].includes(error.statusCode)) {
      notFound()
    }

    throw error
  }

  const estimatedDelivery = new Date(order.createdAt)
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7)

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t("orderConfirmed")}</h1>
        <p className="text-muted-foreground">
          {t("orderNumber")}: {order.id}
        </p>
      </div>

      <div className="border rounded-lg p-6 mb-6">
        <h2 className="font-semibold mb-4">{t("orderSummary")}</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.product.name} x {item.quantity}
              </span>
              <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 flex justify-between font-bold">
          <span>{t("total")}</span>
          <span>${Number(order.totalAmount).toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="flex items-center gap-3 p-4 border rounded-lg">
          <Package className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{t("status")}</p>
            <p className="text-xs text-muted-foreground">{order.status}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 border rounded-lg">
          <Truck className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{t("shipping")}</p>
            <p className="text-xs text-muted-foreground">{order.shippingAddress || t("pending")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 border rounded-lg">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{t("estimatedDelivery")}</p>
            <p className="text-xs text-muted-foreground">
              {estimatedDelivery.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full">
            {t("continueShopping")}
          </Button>
        </Link>
        <Link href={`/orders`} className="flex-1">
          <Button className="w-full">{t("viewOrders")}</Button>
        </Link>
      </div>
    </div>
  )
}
