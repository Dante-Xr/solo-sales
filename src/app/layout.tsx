/**
 * ============================================
 * 根布局文件 (Phase 4 国际化升级)
 * ============================================
 * 2026-04-13: 创建根布局文件，处理语言路由
 * 功能说明：
 *   - 处理语言路由重定向
 *   - 提供基础布局结构
 * ============================================
 */

import { redirect } from 'next/navigation'

export function generateStaticParams() {
  return [
    { locale: 'zh' },
    { locale: 'en' }
  ]
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  redirect('/zh')
}