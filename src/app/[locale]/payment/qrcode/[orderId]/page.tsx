import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PaymentPageLayout } from './PaymentPageLayout'

interface QRCode {
  id: string
  type: string
  name: string
  imageUrl: string
  accountName: string
  isTempSolution: boolean
}

interface Order {
  id: string
  totalAmount: number
  status: string
  user: {
    name: string | null
    email: string
  }
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      images: string[]
      price: number
    }
  }>
}

interface PageProps {
  params: Promise<{ orderId: string; locale: string }>
}

async function loadPaymentData(orderId: string) {
  const [orderData, qrCodesData] = await Promise.all([
    prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
              },
            },
          },
        },
      },
    }),
    prisma.paymentQRCode.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  return { orderData, qrCodesData }
}

function PaymentDataError({ message }: { message: string }) {
  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h2 className="text-red-800 dark:text-red-200 font-semibold text-lg mb-2">加载失败</h2>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          无法加载订单信息，请稍后重试。如果问题持续存在，请联系客服。
        </p>
        <p className="text-xs text-red-500 dark:text-red-500 font-mono">{message}</p>
      </div>
    </div>
  )
}

export default async function QRCodePaymentPage({ params }: PageProps) {
  const { orderId } = await params

  let paymentData: Awaited<ReturnType<typeof loadPaymentData>> | null = null
  let errorMessage: string | null = null

  try {
    paymentData = await loadPaymentData(orderId)
  } catch (error: unknown) {
    console.error('支付页面数据加载失败:', error)
    errorMessage = error instanceof Error ? error.message : '未知错误'
  }

  if (errorMessage) return <PaymentDataError message={errorMessage} />
  if (!paymentData?.orderData) notFound()

  const { orderData, qrCodesData } = paymentData
  if (qrCodesData.length === 0) {
    return (
      <div className="container max-w-4xl py-8 px-4">
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h2 className="text-yellow-800 dark:text-yellow-200 font-semibold text-lg mb-2">收款码未配置</h2>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">系统尚未配置收款码，请联系管理员。</p>
        </div>
      </div>
    )
  }

  const order: Order = {
    id: orderData.id,
    totalAmount: Number(orderData.totalAmount),
    status: orderData.status,
    user: { name: orderData.user.name, email: orderData.user.email },
    items: orderData.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      product: {
        id: item.product.id,
        name: item.product.name,
        images: item.product.images,
        price: Number(item.product.price),
      },
    })),
  }
  const qrCodes: QRCode[] = qrCodesData.map((qr) => ({
    id: qr.id,
    type: qr.type,
    name: qr.name,
    imageUrl: qr.imageUrl,
    accountName: qr.accountName || '',
    isTempSolution: qr.isTempSolution,
  }))

  return <PaymentPageLayout order={order} qrCodes={qrCodes} />
}
