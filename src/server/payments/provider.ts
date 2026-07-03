/**
 * ============================================
 * Payment Provider 接口定义
 * ============================================
 * 创建时间：2026-06-27 20:05:00 +08:00
 * 创建依据：v1.7规范 - 统一支付提供商抽象
 * 功能说明：
 *   - 定义统一的支付提供商接口
 *   - 支持Stripe、Alipay、WeChatPay
 *   - 统一webhook验证和处理
 * ============================================
 */

/**
 * 支付动作类型
 */
export type PaymentAction =
  | { type: 'redirect'; url: string }
  | { type: 'qrcode'; data: string; expiry: Date }
  | { type: 'form'; fields: Record<string, string> }

/**
 * Webhook 原始数据
 * 保留各支付提供商的原始响应数据，用于审计和调试
 */
export interface WebhookRawData {
  /** 支付提供商标识 */
  provider?: 'stripe' | 'alipay' | 'wechatpay' | 'paypal'
  /** 其他动态字段（各提供商特有） */
  [key: string]: unknown
}

/**
 * Webhook事件
 */
export interface WebhookEvent {
  type: 'payment.success' | 'payment.failed' | 'payment.cancelled'
  orderId: string
  transactionId: string
  amount: number
  currency: string
  timestamp: Date
  rawData: WebhookRawData
}

/**
 * 支付结果
 */
export interface PaymentResult {
  success: boolean
  orderId: string
  transactionId: string
  message?: string
}

/**
 * 支付会话参数
 */
export interface PaymentSessionParams {
  orderId: string
  amount: number
  currency: string
  locale: string
  metadata?: Record<string, string>
}

/**
 * 支付提供商接口
 */
export interface PaymentProvider {
  /** 提供商名称 */
  readonly name: 'stripe' | 'alipay' | 'wechatpay' | 'paypal'

  /**
   * 创建支付会话
   * @returns 支付动作（URL或QR码数据）
   */
  createPaymentSession(params: PaymentSessionParams): Promise<PaymentAction>

  /**
   * 验证webhook签名
   */
  verifyWebhook(
    rawBody: string | Buffer,
    signature: string,
    headers?: Record<string, string>
  ): Promise<WebhookEvent>

  /**
   * 处理支付通知
   */
  processPayment(event: WebhookEvent): Promise<PaymentResult>
}
