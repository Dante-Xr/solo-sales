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

interface PaymentPageData {
  order: Order
  qrCodes: QRCode[]
}

interface PaymentPageError {
  title: string
  message: string
  details?: string
  tone: "error" | "warning"
}

function PaymentPageStatus({ title, message, details, tone }: PaymentPageError) {
  const styles = tone === "warning"
    ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200"
    : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"

  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className={`border rounded-lg p-6 ${styles}`}>
        <h2 className="font-semibold text-lg mb-2">{title}</h2>
        <p className="text-sm">{message}</p>
        {details && <p className="text-xs mt-4 font-mono">{details}</p>}
      </div>
    </div>
  )
}

export default async function QRCodePaymentPage({ params }: PageProps) {
  const { orderId } = await params
  let paymentPage: PaymentPageData | null = null
  let pageError: PaymentPageError | null = null

  try {
    // ✅ 服务端直接查询数据库（安全）
    const orderData = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true
              }
            }
          }
        }
      }
    })

    // 订单不存在返回 404
    if (!orderData) {
      notFound()
    }

    // 获取收款码列表
    const qrCodesData = await prisma.paymentQRCode.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

    // 收款码未配置
    if (qrCodesData.length === 0) {
      pageError = {
        title: "收款码未配置",
        message: "系统尚未配置收款码，请联系管理员。",
        tone: "warning",
      }
    } else {
      // 转换为客户端组件需要的格式
      const order: Order = {
      id: orderData.id,
      totalAmount: Number(orderData.totalAmount),
      status: orderData.status,
      user: {
        name: orderData.user.name,
        email: orderData.user.email
      },
      items: orderData.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: Number(item.price),
        product: {
          id: item.product.id,
          name: item.product.name,
          images: item.product.images,
          price: Number(item.product.price)
        }
      }))
      }

      const qrCodes: QRCode[] = qrCodesData.map(qr => ({
      id: qr.id,
      type: qr.type,
      name: qr.name,
      imageUrl: qr.imageUrl,
      accountName: qr.accountName || '',
      isTempSolution: qr.isTempSolution
      }))
      paymentPage = { order, qrCodes }
    }
  } catch (error: unknown) {
    console.error('支付页面数据加载失败:', error)
    pageError = {
      title: "加载失败",
      message: "无法加载订单信息，请稍后重试。如果问题持续存在，请联系客服。",
      details: error instanceof Error ? error.message : "未知错误",
      tone: "error",
    }
  }

  if (pageError) return <PaymentPageStatus {...pageError} />
  if (!paymentPage) notFound()

  return <PaymentPageLayout order={paymentPage.order} qrCodes={paymentPage.qrCodes} />
}
