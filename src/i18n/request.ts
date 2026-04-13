/**
 * ============================================
 * next-intl 配置文件 (Phase 4 国际化升级)
 * ============================================
 * 创建日期: 2026-04-13
 * 创建时间: 19:20
 * 功能说明：
 *   - 为 Next.js App Router 提供国际化支持
 *   - 配置语言检测和翻译加载
 *   - 支持自动从 URL 和用户偏好中检测语言
 * ============================================
 */

import { getRequestConfig } from 'next-intl/server'

/**
 * 支持的语言列表
 * 与翻译文件对应
 */
const supportedLocales = ['en', 'zh']

/**
 * 国际化请求配置
 * @returns 语言配置和翻译加载器
 */
export default getRequestConfig(async ({ locale }) => {
  const detectedLocale = locale || 'zh'
  const validLocale = supportedLocales.includes(detectedLocale) ? detectedLocale : 'zh'

  return {
    locale: validLocale,
    messages: (await import(`../i18n/messages/${validLocale}.json`)).default
  }
})
