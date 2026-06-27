/**
 * ============================================
 * Checkout Service
 * ============================================
 * 创建时间：2026-06-27 21:00:00 +08:00
 * 创建依据：v1.7规范 - 统一checkout流程
 * 功能说明：
 *   - 服务端金额计算
 *   - 库存验证
 *   - 订单创建
 *   - 支付会话初始化
 * ============================================
 */

import { prisma } from '@/lib/prisma'
import { PaymentProviderFactory } from '../payments/factory'
import { createOrder as createOrderFunction } from './order-service'
import type { ServerSessionUser } from '@/server/auth/session'

// 配置常量
const FREE_SHIPPING_THRESHOLD = 50
const SHIPPING_FEE = 5.99

interface CartItem {
  productId: string
  quantity: number
}

interface ShippingAddress {
  name: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
}

interface CheckoutIntentParams {
  userId: string
  items: CartItem[]
  shippingAddress: ShippingAddress
  couponCode?: string
  paymentProvider: 'stripe' | 'alipay' | 'wechatpay'
  locale: string
  sessionUser: ServerSessionUser
}

interface OrderAmount {
  subtotal: number
  shippingFee: number
  discount: number
  totalAmount: number
}

export class CheckoutService {
  /**
   * 创建checkout intent
   */
  async createCheckoutIntent(params: CheckoutIntentParams) {
    // 1. 验证库存
    await this.validateInventory(params.items)

    // 2. 计算金额（服务端，不信任客户端）
    const amount = await this.calculateOrderAmount({
      items: params.items,
      couponCode: params.couponCode
    })

    // 3. 创建PENDING订单
    const order = await createOrderFunction(
      {
        items: params.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shippingAddress: this.formatShippingAddress(params.shippingAddress),
        contactInfo: {
          name: params.shippingAddress.name,
          phone: params.shippingAddress.phone
        }
      },
      params.sessionUser,
      {} // options
    )

    // 4. 初始化支付会话
    const provider = PaymentProviderFactory.getProvider(params.paymentProvider)
    const paymentAction = await provider.createPaymentSession({
      orderId: order.id,
      amount: amount.totalAmount,
      currency: 'USD',
      locale: params.locale,
      metadata: {
        userId: params.userId,
        paymentProvider: params.paymentProvider
      }
    })

    return {
      orderId: order.id,
      paymentProvider: params.paymentProvider,
      paymentAction,
      order: {
        ...amount,
        items: order.items
      }
    }
  }

  /**
   * 计算订单金额（服务端计算，单一职责点）
   */
  async calculateOrderAmount(params: {
    items: CartItem[]
    couponCode?: string
  }): Promise<OrderAmount> {
    // 1. 查询商品价格（从数据库，不信任客户端）
    const productIds = params.items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        price: true,
        name: true
      }
    })

    if (products.length !== productIds.length) {
      throw new Error('Some products not found')
    }

    // 2. 计算小计
    const subtotal = params.items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)
      if (!product) {
        throw new Error(`Product ${item.productId} not found`)
      }
      return sum + (Number(product.price) * item.quantity)
    }, 0)

    // 3. 运费（配置化规则）
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE

    // 4. 优惠（简化处理 - v1.7暂不实现优惠码）
    const discount = 0

    // 5. 总额
    const totalAmount = Math.max(0, subtotal + shippingFee - discount)

    return {
      subtotal: Number(subtotal.toFixed(2)),
      shippingFee: Number(shippingFee.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2))
    }
  }

  /**
   * 验证库存（决策1: 无预留，仅检查）
   */
  async validateInventory(items: CartItem[]): Promise<void> {
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, stock: true }
      })

      if (!product) {
        throw new Error(`Product ${item.productId} not found`)
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`)
      }
    }

    // 注意: v1.7决策1 - 不预留库存，支付成功时再次检查并扣减
  }

  /**
   * 格式化收货地址为字符串
   */
  private formatShippingAddress(address: ShippingAddress): string {
    return `${address.name}, ${address.phone}, ${address.address}, ${address.city}, ${address.province}, ${address.postalCode}`
  }
}
