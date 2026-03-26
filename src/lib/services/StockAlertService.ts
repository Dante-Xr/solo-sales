/**
 * ============================================
 * 库存预警服务 (v0.5.8)
 * ============================================
 * 功能说明：
 *   - 检测低库存商品
 *   - 发送预警通知邮件
 *   - 记录预警历史
 * ============================================
 */

import { prisma } from "@/lib/prisma"
import { sendEmail, generateLowStockAlertEmail } from "./EmailService"

export async function checkLowStockProducts(): Promise<{
  checked: number
  alertsSent: number
}> {
  let checked = 0
  let alertsSent = 0

  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        isPublished: true,
        stockAlert: {
          isEnabled: true,
        },
      },
      include: {
        stockAlert: true,
      },
    })

    for (const product of lowStockProducts) {
      checked++

      if (product.stockAlert && product.stock <= product.stockAlert.threshold) {
        const lastAlertAt = product.stockAlert.lastAlertAt
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

        if (!lastAlertAt || lastAlertAt < twentyFourHoursAgo) {
          const result = await sendStockAlert(product, product.stockAlert.notifyEmails)

          if (result.sent) {
            alertsSent++

            await prisma.stockAlert.update({
              where: { productId: product.id },
              data: { lastAlertAt: new Date() },
            })

            await prisma.stockAlertLog.create({
              data: {
                productId: product.id,
                productName: product.name,
                oldStock: product.stock + 1,
                newStock: product.stock,
                threshold: product.stockAlert.threshold,
                notifiedEmails: product.stockAlert.notifyEmails,
              },
            })
          }
        }
      }
    }

    return { checked, alertsSent }
  } catch (error) {
    console.error("Error checking low stock products:", error)
    return { checked, alertsSent }
  }
}

async function sendStockAlert(
  product: { id: string; name: string; stock: number },
  notifyEmails: string[]
): Promise<{ sent: boolean; error?: string }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const productUrl = `${baseUrl}/admin/products?id=${product.id}`

    const alertConfig = await prisma.stockAlert.findUnique({
      where: { productId: product.id },
    })

    if (!alertConfig) {
      return { sent: false, error: "No alert config found" }
    }

    const { subject, html } = generateLowStockAlertEmail({
      productName: product.name,
      productId: product.id,
      currentStock: product.stock,
      threshold: alertConfig.threshold,
      productUrl,
      locale: "en",
    })

    for (const email of notifyEmails) {
      await sendEmail({ to: email, subject, html })
    }

    return { sent: true }
  } catch (error) {
    console.error("Error sending stock alert:", error)
    return { sent: false, error: String(error) }
  }
}

export async function createOrUpdateStockAlert(params: {
  productId: string
  threshold: number
  isEnabled: boolean
  notifyEmails: string[]
}): Promise<void> {
  const { productId, threshold, isEnabled, notifyEmails } = params

  await prisma.stockAlert.upsert({
    where: { productId },
    create: {
      productId,
      threshold,
      isEnabled,
      notifyEmails,
    },
    update: {
      threshold,
      isEnabled,
      notifyEmails,
    },
  })
}

export async function deleteStockAlert(productId: string): Promise<void> {
  await prisma.stockAlert.delete({
    where: { productId },
  }).catch(() => {})
}

export async function getStockAlertConfig(productId: string): Promise<{
  threshold: number
  isEnabled: boolean
  notifyEmails: string[]
} | null> {
  const alert = await prisma.stockAlert.findUnique({
    where: { productId },
  })

  if (!alert) return null

  return {
    threshold: alert.threshold,
    isEnabled: alert.isEnabled,
    notifyEmails: alert.notifyEmails,
  }
}

export async function getStockAlertLogs(productId?: string, limit = 50): Promise<{
  logs: Array<{
    id: string
    productId: string
    productName: string
    oldStock: number
    newStock: number
    threshold: number
    createdAt: Date
  }>
}> {
  const where = productId ? { productId } : {}

  const logs = await prisma.stockAlertLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return { logs }
}