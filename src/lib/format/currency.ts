/**
 * ============================================
 * 货币格式化工具函数
 * ============================================
 * 创建时间：2026-06-27 05:00:00 +08:00
 * 创建依据：前端开发者专家建议 - P2优先级
 * 功能说明：
 *   - 统一的货币格式化函数
 *   - 支持多币种和多语言
 *   - 消除23处formatPrice重复代码
 * ============================================
 */

/**
 * 格式化货币金额
 * @param amount 金额数值
 * @param currency 货币代码 (默认: USD)
 * @param locale 语言环境 (默认: en-US)
 * @returns 格式化后的货币字符串
 * @example
 * formatCurrency(99.99) // "$99.99"
 * formatCurrency(99.99, 'EUR', 'de-DE') // "99,99 €"
 * formatCurrency(99.99, 'CNY', 'zh-CN') // "¥99.99"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * 格式化货币金额（紧凑模式）
 * @param amount 金额数值
 * @param currency 货币代码
 * @param locale 语言环境
 * @returns 格式化后的紧凑货币字符串
 * @example
 * formatCurrencyCompact(1500) // "$1.5K"
 * formatCurrencyCompact(1500000) // "$1.5M"
 */
export function formatCurrencyCompact(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)
}
