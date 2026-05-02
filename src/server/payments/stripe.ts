/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：新增 Stripe 服务端客户端封装，集中校验密钥格式并延迟初始化 SDK。
 * 修改模型：gpt-5.5
 */
import "server-only"

import Stripe from "stripe"
import { AppError, ErrorCodes } from "@/server/contracts/errors"

const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2026-02-25.clover"

let stripeClient: Stripe | null = null

export function isStripeTestMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY || ""
  return key.startsWith("sk_test_")
}

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY

  // Stripe 密钥只允许服务端读取；错误消息不包含密钥内容，避免泄露敏感信息。
  if (!secretKey) {
    throw new AppError(
      ErrorCodes.PAYMENT_CONFIGURATION_ERROR,
      "STRIPE_SECRET_KEY 未配置。请在环境变量中设置 Stripe 密钥",
      500
    )
  }

  if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
    throw new AppError(
      ErrorCodes.PAYMENT_CONFIGURATION_ERROR,
      "STRIPE_SECRET_KEY 格式无效。必须以 sk_test_ 或 sk_live_ 开头",
      500
    )
  }

  if (!stripeClient) {
    // 延迟初始化，避免测试和未使用支付功能的请求提前读取 Stripe 配置。
    stripeClient = new Stripe(secretKey, {
      apiVersion: STRIPE_API_VERSION,
    })
  }

  return stripeClient
}
