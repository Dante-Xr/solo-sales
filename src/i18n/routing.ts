/**
 * ============================================
 * next-intl 路由配置文件 (Phase 4 国际化升级)
 * ============================================
 * 创建日期: 2026-04-13
 * 创建时间: 19:15
 * 功能说明：
 *   - 定义支持的语言列表
 *   - 配置默认语言
 *   - 定义路由行为
 * ============================================
 */

import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'zh'],
  defaultLocale: 'zh',
  localePrefix: 'always',
})
