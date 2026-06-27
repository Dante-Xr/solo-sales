/**
 * ============================================
 * 订单状态管理扩展 (v1.7)
 * ============================================
 * 创建时间：2026-06-27 22:30:00 +08:00
 * 创建依据：v1.7规范 - 订单状态机扩展
 * 功能说明：
 *   - 支付成功处理
 *   - 库存扣减（幂等）
 *   - 状态流转管理
 * ============================================
 */

import "server-only"

import { prisma } from "@/lib/prisma"
import { OrderStatus, PaymentStatus } from "@prisma/client"
import { notFound } from "@/server/contracts/errors"

/**
 * 处理支付成功事件
 * - 更新订单状态为PAID
 * - 扣减库存（幂等性保证）
 * - 创建支付记录
 */
export async function handlePaymentSuccess(params: {
  orderId: string
  transactionId: string
  amount: number
  provider: string
}): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1. 获取订单
    const order = await tx.order.findUnique({
      where: { id: params.orderId },
      include: { items: true }
    })

    if (!order) {
      throw notFound(`订单 ${params.orderId}`)
    }

    // 2. 幂等性检查：如果已经是PAID状态，直接返回
    if (order.status === OrderStatus.PAID) {
      console.info(`Order ${params.orderId} already paid, skipping`)
      return
    }

    // 3. 验证状态流转合法性
    if (order.status !== OrderStatus.PENDING) {
      throw new Error(`Invalid order status transition: ${order.status} -> PAID`)
    }

    // 4. 扣减库存（仅在PENDING -> PAID时执行）
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    // 5. 更新订单状态
    await tx.order.update({
      where: { id: params.orderId },
      data: {
        status: OrderStatus.PAID,
        paymentMethod: params.provider
      }
    })

    // 6. 创建或更新支付记录
    // 使用provider+transactionId作为唯一标识（符合schema的unique约束）
    const existingPayment = await tx.payment.findFirst({
      where: {
        provider: params.provider,
        transactionId: params.transactionId
      }
    })

    if (existingPayment) {
      // 更新现有支付记录
      await tx.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          amount: params.amount
        }
      })
    } else {
      // 创建新支付记录
      await tx.payment.create({
        data: {
          orderId: params.orderId,
          amount: params.amount,
          provider: params.provider,
          status: PaymentStatus.COMPLETED,
          transactionId: params.transactionId
        }
      })
    }
  })
}

/**
 * 更新订单支付状态
 */
export async function updateOrderPaymentStatus(params: {
  orderId: string
  status: 'PAID' | 'CANCELLED'
  transactionId: string
  provider: string
}): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: params.orderId }
    })

    if (!order) {
      throw notFound(`订单 ${params.orderId}`)
    }

    // 更新订单状态
    const targetStatus = params.status === 'PAID'
      ? OrderStatus.PAID
      : OrderStatus.CANCELLED

    await tx.order.update({
      where: { id: params.orderId },
      data: {
        status: targetStatus,
        paymentMethod: params.provider
      }
    })

    // 创建或更新支付记录
    const existingPayment = await tx.payment.findFirst({
      where: {
        provider: params.provider,
        transactionId: params.transactionId
      }
    })

    if (existingPayment) {
      await tx.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: params.status === 'PAID' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED
        }
      })
    } else {
      await tx.payment.create({
        data: {
          orderId: params.orderId,
          amount: order.totalAmount,
          provider: params.provider,
          status: params.status === 'PAID' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
          transactionId: params.transactionId
        }
      })
    }
  })
}

/**
 * 查询支付记录（用于幂等性检查）
 */
export async function findPaymentByTransactionId(
  provider: string,
  transactionId: string
) {
  return await prisma.payment.findFirst({
    where: {
      provider,
      transactionId
    }
  })
}
