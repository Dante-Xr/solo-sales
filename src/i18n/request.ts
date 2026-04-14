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

const supportedLocales = ['en', 'zh']
const defaultLocale = 'zh'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const detectedLocale = supportedLocales.includes(requested || '') ? requested : defaultLocale

  return {
    locale: detectedLocale,
    messages: (await import(`../i18n/messages/${detectedLocale}.json`)).default
  }
})
