/**
 * ============================================
 * 邮件服务 (v0.5.8)
 * ============================================
 * 功能说明：
 *   - 发送事务性邮件
 *   - 废弃购物车挽回邮件
 *   - 库存预警通知邮件
 * ============================================
 */

import { logger } from "@/lib/logger"

interface EmailOptions {
  to: string
  subject: string
  html: string
}

interface SendEmailResult {
  success: boolean
  error?: string
  messageId?: string
}

export async function sendEmail(options: EmailOptions): Promise<SendEmailResult> {
  const { to, subject, html } = options

  try {
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      logger.warn("RESEND_API_KEY not configured, logging email instead")
      logger.debug("📧 Email would be sent to", { to, subject })
      return { success: true, messageId: "demo-mode" }
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "SoloSales <noreply@solosales.com>",
        to,
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      logger.error("Failed to send email", new Error(error))
      return { success: false, error }
    }

    const data = await response.json()
    return { success: true, messageId: data.id }
  } catch (error) {
    logger.error("Email send error", error)
    return { success: false, error: String(error) }
  }
}

export function generateAbandonedCartEmail(params: {
  userName?: string
  cartItems: Array<{
    name: string
    price: number
    image?: string
    quantity: number
  }>
  totalAmount: number
  locale: string
  recoveryUrl: string
}): { subject: string; html: string } {
  const { userName, cartItems, totalAmount, locale, recoveryUrl } = params
  const isZh = locale === "zh"

  const itemsHtml = cartItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; vertical-align: middle; margin-right: 12px;" />` : ""}
          <span>${item.name}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>
    `
    )
    .join("")

  const subject = isZh ? "您有一件商品还在等您回来 🛒" : "You left something behind... 🛒"

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #2563eb; margin: 0;">🛒 SoloSales</h1>
      </div>

      <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin: 20px 0;">
        <h2 style="margin: 0 0 16px 0; font-size: 20px;">
          ${isZh ? `Hi ${userName || isZh ? "亲爱的顾客" : "there"},` : `Hi ${userName || "there"},`}
        </h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">
          ${isZh
            ? "您添加到购物车的商品还在等您回来："
            : "You left something in your cart. They're still waiting for you!"}
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 12px; text-align: left;">${isZh ? "商品" : "Item"}</th>
            <th style="padding: 12px; text-align: center;">${isZh ? "数量" : "Qty"}</th>
            <th style="padding: 12px; text-align: right;">${isZh ? "价格" : "Price"}</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 12px; font-weight: bold; text-align: right;">${isZh ? "总计" : "Total"}:</td>
            <td style="padding: 12px; font-weight: bold; text-align: right;">$${totalAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${recoveryUrl}"
           style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          ${isZh ? "立即结账" : "Checkout Now"} →
        </a>
      </div>

      <div style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 32px;">
        <p>${isZh ? "如果您不再感兴趣，忽略此邮件即可。" : "If you're no longer interested, just ignore this email."}</p>
        <p style="margin-top: 8px;">© 2024 SoloSales</p>
      </div>
    </body>
    </html>
  `

  return { subject, html }
}

export function generateLowStockAlertEmail(params: {
  productName: string
  productId: string
  currentStock: number
  threshold: number
  productUrl: string
  locale: string
}): { subject: string; html: string } {
  const { productName, currentStock, threshold, productUrl, locale } = params
  const isZh = locale === "zh"

  const subject = isZh
    ? `⚠️ 库存预警：${productName} 库存不足`
    : `⚠️ Low Stock Alert: ${productName} is running low`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #dc2626; margin: 0;">⚠️ ${isZh ? "库存预警" : "Stock Alert"}</h1>
      </div>

      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin: 20px 0;">
        <h2 style="margin: 0 0 16px 0; font-size: 20px;">${productName}</h2>

        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0;"><strong>${isZh ? "当前库存" : "Current Stock"}:</strong></td>
            <td style="padding: 8px 0; color: #dc2626; font-weight: bold; font-size: 24px;">${currentStock}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>${isZh ? "预警阈值" : "Alert Threshold"}:</strong></td>
            <td style="padding: 8px 0;">${threshold}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 16px; line-height: 1.6;">
        ${isZh
          ? `商品「${productName}」的库存已低于预警阈值（${threshold}），当前库存仅为 ${currentStock} 件。`
          : `The product "${productName}" has fallen below the alert threshold (${threshold}). Current stock is only ${currentStock} units.`}
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${productUrl}"
           style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          ${isZh ? "立即补货" : "Reorder Now"} →
        </a>
      </div>

      <div style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 32px;">
        <p>© 2024 SoloSales</p>
      </div>
    </body>
    </html>
  `

  return { subject, html }
}