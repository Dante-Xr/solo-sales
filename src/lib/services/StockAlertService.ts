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

const LOW_STOCK_THRESHOLD = 10

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
        stock: {
          lte: LOW_STOCK_THRESHOLD,
        },
      },
    })

    for (const product of lowStockProducts) {
      checked++

      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)

      const recentLog = await prisma.stockAlertLog.findFirst({
        where: {
          productId: product.id,
          createdAt: {
            gte: last24Hours,
          },
        },
      })

      if (recentLog) continue

      const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com"
      const result = await sendStockAlert(product, [adminEmail])

      if (result.sent) {
        alertsSent++

        await prisma.stockAlertLog.create({
          data: {
            productId: product.id,
            productName: product.name,
            oldStock: product.stock + 1,
            newStock: product.stock,
            threshold: LOW_STOCK_THRESHOLD,
            notifiedEmails: [adminEmail],
          },
        })
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

    const { subject, html } = generateLowStockAlertEmail({
      productName: product.name,
      productId: product.id,
      currentStock: product.stock,
      threshold: LOW_STOCK_THRESHOLD,
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

export async function createOrUpdateStockAlert(params: {
  productId: string
  threshold: number
  isEnabled: boolean
  notifyEmails: string[]
}): Promise<void> {
  console.log("StockAlert model not available, createOrUpdateStockAlert called with:", params)
}

export async function deleteStockAlert(productId: string): Promise<void> {
  console.log("StockAlert model not available, deleteStockAlert called for:", productId)
}

export async function getStockAlertConfig(_productId: string): Promise<{
  threshold: number
  isEnabled: boolean
  notifyEmails: string[]
} | null> {
  return null
}