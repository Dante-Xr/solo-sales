/**
 * ============================================
 * Payment Provider Factory
 * ============================================
 * 创建时间：2026-06-27 20:20:00 +08:00
 * 创建依据：v1.7规范 - 统一支付提供商工厂
 * 功能说明：
 *   - 管理所有支付提供商实例
 *   - 根据环境变量控制启用的提供商
 *   - 支持Stripe/Alipay/WeChat/PayPal
 * ============================================
 */

import { PaymentProvider } from './provider'
import { StripeProvider } from './providers/stripe-provider'
import { AlipayProvider } from './providers/alipay-provider'
import { WeChatPayProvider } from './providers/wechatpay-provider'
import { PayPalProvider } from './providers/paypal-provider'

export class PaymentProviderFactory {
  private static providers = new Map<string, PaymentProvider>([
    ['stripe', new StripeProvider()],
    ['alipay', new AlipayProvider()],
    ['wechatpay', new WeChatPayProvider()],
    ['paypal', new PayPalProvider()] // 决策4: 保留但默认禁用
  ])

  /**
   * 获取指定的支付提供商
   * @throws {Error} 如果提供商不存在或未启用
   */
  static getProvider(name: string): PaymentProvider {
    const provider = this.providers.get(name)
    if (!provider) {
      throw new Error(`Unknown payment provider: ${name}`)
    }

    // 检查是否启用
    if (!this.isProviderEnabled(name)) {
      throw new Error(`Payment provider ${name} is not enabled. Check ENABLED_PAYMENT_PROVIDERS env var`)
    }

    return provider
  }

  /**
   * 获取所有启用的支付提供商
   */
  static getEnabledProviders(): PaymentProvider[] {
    // 默认启用: stripe, alipay, wechatpay (不包含paypal)
    const enabled = process.env.ENABLED_PAYMENT_PROVIDERS?.split(',').map(s => s.trim()) ||
      ['stripe', 'alipay', 'wechatpay']

    return enabled
      .map(name => this.providers.get(name))
      .filter((p): p is PaymentProvider => p !== undefined)
  }

  /**
   * 检查提供商是否启用
   */
  private static isProviderEnabled(name: string): boolean {
    const enabled = process.env.ENABLED_PAYMENT_PROVIDERS?.split(',').map(s => s.trim()) ||
      ['stripe', 'alipay', 'wechatpay']
    return enabled.includes(name)
  }

  /**
   * 获取所有可用的提供商名称（不论是否启用）
   */
  static getAllProviderNames(): string[] {
    return Array.from(this.providers.keys())
  }
}
