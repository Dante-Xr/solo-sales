/**
 * PayPal Webhook Handler
 *
 * 创建时间：2026-06-30
 * 功能：接收并处理 PayPal 发送的 Webhook 事件
 *
 * POST /api/webhooks/paypal
 *
 * 支持的事件：
 * - PAYMENT.CAPTURE.COMPLETED（支付成功）
 * - PAYMENT.CAPTURE.DENIED（支付失败）
 * - CHECKOUT.ORDER.APPROVED（订单批准）
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PaymentProviderFactory } from '@/server/payments/factory'

export async function POST(req: NextRequest) {
  try {
    // 获取原始请求体（用于签名验证）
    const rawBody = await req.text()

    // 获取 PayPal 签名头
    const signature = req.headers.get('paypal-transmission-sig') || ''
    const headers = {
      'paypal-transmission-id': req.headers.get('paypal-transmission-id') || '',
      'paypal-transmission-time': req.headers.get('paypal-transmission-time') || '',
      'paypal-cert-url': req.headers.get('paypal-cert-url') || '',
      'paypal-auth-algo': req.headers.get('paypal-auth-algo') || ''
    }

    // 验证签名并解析事件
    const paypalProvider = PaymentProviderFactory.getProvider('paypal')
    const event = await paypalProvider.verifyWebhook(rawBody, signature, headers)

    console.log('PayPal webhook event:', {
      type: event.type,
      orderId: event.orderId,
      transactionId: event.transactionId
    })

    // 查询订单
    const order = await prisma.order.findUnique({
      where: { id: event.orderId }
    })

    if (!order) {
      console.error(`Order not found: ${event.orderId}`)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // 幂等性检查：检查是否已处理过此交易
    const existingPayment = await prisma.payment.findFirst({
      where: {
        orderId: event.orderId,
        transactionId: event.transactionId
      }
    })

    if (existingPayment) {
      console.log(`Payment already processed: ${event.transactionId}`)
      return NextResponse.json({
        success: true,
        message: 'Webhook already processed',
        duplicate: true
      })
    }

    // 处理不同的事件类型
    if (event.type === 'payment.success') {
      // 更新订单状态
      await prisma.order.update({
        where: { id: event.orderId },
        data: {
          status: 'PAID',
          updatedAt: new Date()
        }
      })

      // 创建支付记录
      await prisma.payment.create({
        data: {
          orderId: event.orderId,
          provider: 'paypal',
          transactionId: event.transactionId,
          amount: order.totalAmount,
          currency: event.currency,
          status: 'COMPLETED'
        }
      })

      // TODO: 扣减库存（需要 OrderStateMachine 集成）
      console.log(`✅ PayPal payment success for order ${event.orderId}`)

      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully'
      })
    }

    if (event.type === 'payment.failed') {
      // 更新订单状态为失败
      await prisma.order.update({
        where: { id: event.orderId },
        data: {
          status: 'CANCELLED', // 使用已存在的状态
          updatedAt: new Date()
        }
      })

      // 创建失败的支付记录
      await prisma.payment.create({
        data: {
          orderId: event.orderId,
          provider: 'paypal',
          transactionId: event.transactionId,
          amount: order.totalAmount,
          currency: event.currency,
          status: 'FAILED'
        }
      })

      console.log(`❌ PayPal payment failed for order ${event.orderId}`)

      return NextResponse.json({
        success: true,
        message: 'Payment failure recorded'
      })
    }

    if (event.type === 'payment.cancelled') {
      // 更新订单状态为取消
      await prisma.order.update({
        where: { id: event.orderId },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      })

      console.log(`⚠️ PayPal payment cancelled for order ${event.orderId}`)

      return NextResponse.json({
        success: true,
        message: 'Payment cancellation recorded'
      })
    }

    // 未知事件类型
    console.warn(`Unknown event type: ${event.type}`)
    return NextResponse.json({
      success: true,
      message: 'Event received but not processed'
    })

  } catch (error: any) {
    console.error('PayPal webhook error:', error)

    // Webhook 验证失败
    if (error.message?.includes('verification failed')) {
      return NextResponse.json(
        { error: 'Webhook verification failed' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
}
