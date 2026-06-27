/**
 * ============================================
 * 日期格式化工具函数
 * ============================================
 * 创建时间：2026-06-27 05:00:00 +08:00
 * 创建依据：前端开发者专家建议 - P2优先级
 * 功能说明：
 *   - 统一的日期格式化函数
 *   - 支持多语言和多格式
 *   - 消除15处formatDate重复代码
 * ============================================
 */

/**
 * 格式化日期
 * @param date 日期对象或字符串
 * @param locale 语言环境 (默认: en-US)
 * @param options 格式化选项
 * @returns 格式化后的日期字符串
 * @example
 * formatDate(new Date()) // "Jun 27, 2026"
 * formatDate("2026-06-27", "zh-CN") // "2026年6月27日"
 */
export function formatDate(
  date: Date | string,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }

  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObj)
}

/**
 * 格式化日期时间
 * @param date 日期对象或字符串
 * @param locale 语言环境
 * @returns 格式化后的日期时间字符串
 * @example
 * formatDateTime(new Date()) // "Jun 27, 2026, 5:00 AM"
 */
export function formatDateTime(
  date: Date | string,
  locale: string = 'en-US'
): string {
  return formatDate(date, locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * 格式化相对时间
 * @param date 日期对象或字符串
 * @param locale 语言环境
 * @returns 相对时间字符串
 * @example
 * formatRelativeTime(new Date()) // "just now"
 * formatRelativeTime(Date.now() - 3600000) // "1 hour ago"
 */
export function formatRelativeTime(
  date: Date | string,
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (diffSecs < 60) return locale === 'zh-CN' ? '刚刚' : 'just now'
  if (diffMins < 60) return rtf.format(-diffMins, 'minute')
  if (diffHours < 24) return rtf.format(-diffHours, 'hour')
  if (diffDays < 30) return rtf.format(-diffDays, 'day')

  return formatDate(dateObj, locale)
}
