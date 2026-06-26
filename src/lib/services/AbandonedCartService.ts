/**
 * ============================================
 * 废弃购物车服务 (v0.5.8)
 * ============================================
 * 功能说明：
 *   - 检测废弃购物车
 *   - 发送挽回邮件序列
 *   - 追踪恢复状态
 * ============================================
 */

import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { sendEmail, generateAbandonedCartEmail } from "./EmailService"

const CART_ABANDON_HOURS = 1
const SECOND_EMAIL_HOURS = 24

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

export async function checkAbandonedCarts(): Promise<{
  processed: number
  emailsSent: number
  recovered: number
}> {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - CART_ABANDON_HOURS * 60 * 60 * 1000)
  const twentyFourHoursAgo = new Date(now.getTime() - SECOND_EMAIL_HOURS * 60 * 60 * 1000)

  let processed = 0
  let emailsSent = 0
  let recovered = 0

  try {
    const abandonedCarts = await prisma.abandonedCart.findMany({
      where: {
        status: {
          in: ["PENDING", "SENT"],
        },
        createdAt: {
          lt: oneHourAgo,
        },
      },
    })

    for (const cart of abandonedCarts) {
      processed++

      if (cart.status === "PENDING") {
        const result = await sendAbandonedCartEmail(cart.id, cart.userEmail, cart.cartData as unknown as CartItem[], cart.locale)
        if (result.sent) emailsSent++
      } else if (cart.status === "SENT" && cart.lastEmailAt && cart.lastEmailAt < twentyFourHoursAgo) {
        const result = await sendSecondEmail(cart.id, cart.userEmail, cart.cartData as unknown as CartItem[], cart.locale)
        if (result.sent) emailsSent++
      }
    }

    const recoveredCarts = await prisma.abandonedCart.updateMany({
      where: {
        status: "PENDING",
        userId: {
          in: (
            await prisma.order.findMany({
              where: {
                createdAt: {
                  gt: oneHourAgo,
                },
              },
              select: { userId: true },
            })
          ).map((o) => o.userId),
        },
      },
      data: {
        status: "RECOVERED",
        recoveredAt: new Date(),
      },
    })
    recovered = recoveredCarts.count

    return { processed, emailsSent, recovered }
  } catch (error) {
    logger.error("Error checking abandoned carts", error)
    return { processed, emailsSent, recovered }
  }
}

async function sendAbandonedCartEmail(
  cartId: string,
  email: string,
  cartItems: CartItem[],
  locale: string
): Promise<{ sent: boolean; error?: string }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const recoveryUrl = `${baseUrl}/cart?ref=abandoned&cartId=${cartId}`

    const { subject, html } = generateAbandonedCartEmail({
      userName: "",
      cartItems,
      totalAmount: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      locale,
      recoveryUrl,
    })

    const result = await sendEmail({ to: email, subject, html })

    if (result.success) {
      await prisma.abandonedCart.update({
        where: { id: cartId },
        data: {
          status: "SENT",
          lastEmailAt: new Date(),
          emailCount: { increment: 1 },
        },
      })
    }

    return { sent: result.success, error: result.error }
  } catch (error) {
    logger.error("Error sending abandoned cart email", error)
    return { sent: false, error: String(error) }
  }
}

async function sendSecondEmail(
  cartId: string,
  email: string,
  cartItems: CartItem[],
  locale: string
): Promise<{ sent: boolean; error?: string }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const recoveryUrl = `${baseUrl}/cart?ref=abandoned&cartId=${cartId}`

    const isZh = locale === "zh"
    const _totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const subject = isZh ? "您的购物车还在等您... 🎁" : "Still waiting for you... 🎁"
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
            ${isZh ? "您的购物车还在等您..." : "Your cart is still waiting..."}
          </h2>
          <p style="margin: 0; font-size: 16px; line-height: 1.6;">
            ${isZh
              ? "别忘了您还有商品在购物车里！我们为您准备了一点小惊喜："
              : "Don't forget about the items in your cart! We've prepared a little surprise for you:"}
          </p>
        </div>

        <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #92400e;">
            🎁 ${isZh ? "限时 10% 折扣码" : "10% OFF with code"} 🎁
          </p>
          <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #92400e;">
            COMEBACK10
          </p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${recoveryUrl}"
             style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            ${isZh ? "使用折扣结账" : "Checkout with Discount"} →
          </a>
        </div>

        <div style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 32px;">
          <p>© 2024 SoloSales</p>
        </div>
      </body>
      </html>
    `

    const result = await sendEmail({ to: email, subject, html })

    if (result.success) {
      await prisma.abandonedCart.update({
        where: { id: cartId },
        data: {
          status: "SENT_SECOND",
          lastEmailAt: new Date(),
          emailCount: { increment: 1 },
        },
      })
    }

    return { sent: result.success, error: result.error }
  } catch (error) {
    logger.error("Error sending second abandoned cart email", error)
    return { sent: false, error: String(error) }
  }
}

export async function recordAbandonedCart(params: {
  userId: string
  userEmail: string
  userName?: string
  cartData: CartItem[]
  totalAmount: number
  locale?: string
}): Promise<string> {
  const { userId, userEmail, userName, cartData, totalAmount, locale = "en" } = params

  const existingCart = await prisma.abandonedCart.findFirst({
    where: {
      userId,
      status: { in: ["PENDING", "SENT"] },
    },
  })

  if (existingCart) {
    await prisma.abandonedCart.update({
      where: { id: existingCart.id },
      data: {
        cartData: cartData as unknown as object,
        totalAmount,
        userEmail,
        userName,
        locale,
      },
    })
    return existingCart.id
  }

  const cart = await prisma.abandonedCart.create({
    data: {
      userId,
      userEmail,
      userName,
      cartData: cartData as unknown as object,
      totalAmount,
      locale,
    },
  })

  return cart.id
}

export async function markCartAsRecovered(userId: string): Promise<void> {
  await prisma.abandonedCart.updateMany({
    where: {
      userId,
      status: { in: ["PENDING", "SENT", "SENT_SECOND"] },
    },
    data: {
      status: "RECOVERED",
      recoveredAt: new Date(),
    },
  })
}