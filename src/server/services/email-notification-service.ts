import nodemailer from 'nodemailer'
import type { Order, User } from '@prisma/client'

export class EmailNotificationService {
  private transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }

  async sendPaymentApprovedEmail(order: Order, user: User) {
    const siteName = process.env.SITE_NAME || 'SoloSales'
    const domain = process.env.DOMAIN || 'localhost'
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

    await this.transporter.sendMail({
      from: `"${siteName}" <noreply@${domain}>`,
      to: user.email,
      subject: `✅ 支付审核通过 - 订单 #${order.id.slice(0, 8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">✅ 支付已确认</h2>
          <p>尊敬的 ${user.name || '客户'}：</p>
          <p>您的订单支付已确认。</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>订单号：</strong>#${order.id.slice(0, 8)}</p>
            <p><strong>支付金额：</strong>¥${order.totalAmount}</p>
          </div>
          <p>我们将尽快为您发货。</p>
          <a href="${baseUrl}/orders/${order.id}"
             style="display: inline-block; background: #3b82f6; color: white;
                    padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            查看订单详情
          </a>
        </div>
      `
    })
  }

  async sendPaymentRejectedEmail(order: Order, user: User, rejectReason: string) {
    const siteName = process.env.SITE_NAME || 'SoloSales'
    const domain = process.env.DOMAIN || 'localhost'
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

    await this.transporter.sendMail({
      from: `"${siteName}" <noreply@${domain}>`,
      to: user.email,
      subject: `❌ 支付凭证审核未通过 - 订单 #${order.id.slice(0, 8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">❌ 凭证审核未通过</h2>
          <p>尊敬的 ${user.name || '客户'}：</p>
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>原因：</strong>${rejectReason}</p>
          </div>
          <p>请重新上传清晰的支付截图。</p>
          <a href="${baseUrl}/payment/qrcode/${order.id}">重新上传凭证</a>
        </div>
      `
    })
  }

  async sendAutoApprovedEmail(order: Order, user: User) {
    const siteName = process.env.SITE_NAME || 'SoloSales'
    const domain = process.env.DOMAIN || 'localhost'

    await this.transporter.sendMail({
      from: `"${siteName}" <noreply@${domain}>`,
      to: user.email,
      subject: `🎉 支付已自动确认 - 订单 #${order.id.slice(0, 8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">🎉 支付已自动确认</h2>
          <p>系统已自动识别您的支付凭证，订单支付已确认！</p>
        </div>
      `
    })
  }
}
