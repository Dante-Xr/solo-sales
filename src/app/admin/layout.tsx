/**
 * ============================================
 * 管理后台根布局组件 (v0.4.1 优化版)
 * ============================================
 * 功能说明：
 *   - 使用响应式 AdminLayout 组件
 *   - 支持移动端适配 (iPhone 13 Pro Max, Xiaomi 14 Ultra)
 *   - 提供统一的页面布局结构
 * ============================================
 */

import { AdminLayout } from "@/components/admin/AdminLayout"

/**
 * 管理后台布局组件
 * @param children - 各子页面（如 /admin、/admin/products）的内容
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}
