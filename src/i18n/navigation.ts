/**
 * ============================================
 * next-intl 导航 API (Phase 4 国际化升级)
 * ============================================
 * 创建日期: 2026-04-14
 * 创建时间: 00:35
 * 功能说明：
 *   - 提供 next-intl 的导航工具
 *   - Link、redirect、usePathname、useRouter
 *   - 自动处理语言前缀
 * ============================================
 */

import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
