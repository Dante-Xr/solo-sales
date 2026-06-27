/**
 * ============================================
 * 文本格式化工具函数
 * ============================================
 * 创建时间：2026-06-27 05:00:00 +08:00
 * 创建依据：前端开发者专家建议 - P2优先级
 * 功能说明：
 *   - 统一的文本处理函数
 *   - 截断、大小写转换等
 *   - 消除8处truncateText重复代码
 * ============================================
 */

/**
 * 截断文本并添加省略号
 * @param text 原始文本
 * @param maxLength 最大长度
 * @param suffix 后缀 (默认: "...")
 * @returns 截断后的文本
 * @example
 * truncateText("Hello World", 5) // "Hello..."
 * truncateText("你好世界", 2, "…") // "你好…"
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + suffix
}

/**
 * 首字母大写
 * @param text 原始文本
 * @returns 首字母大写的文本
 * @example
 * capitalize("hello") // "Hello"
 */
export function capitalize(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * 转换为标题格式（每个单词首字母大写）
 * @param text 原始文本
 * @returns 标题格式的文本
 * @example
 * toTitleCase("hello world") // "Hello World"
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}

/**
 * 移除HTML标签
 * @param html HTML字符串
 * @returns 纯文本
 * @example
 * stripHtml("<p>Hello</p>") // "Hello"
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * 格式化数字为可读格式
 * @param num 数字
 * @returns 格式化后的字符串
 * @example
 * formatNumber(1234567) // "1,234,567"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * 格式化数字为紧凑格式
 * @param num 数字
 * @returns 紧凑格式字符串
 * @example
 * formatNumberCompact(1500) // "1.5K"
 * formatNumberCompact(1500000) // "1.5M"
 */
export function formatNumberCompact(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
