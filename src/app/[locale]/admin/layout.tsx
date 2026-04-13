/**
 * ============================================
 * 管理后台根布局组件 (v1.0.0)
 * ============================================
 * 功能说明：
 *   - 使用响应式 AdminLayout 组件
 *   - 支持移动端适配 (iPhone 13 Pro Max, Xiaomi 14 Ultra)
 *   - 提供统一的页面布局结构
 *   - 集成权限 Provider (v0.4.3)
 *   - 集成 Refine 框架 (v1.0.0)
 * ============================================
 * 2026-04-13: 添加 RefineProvider 包裹
 */

import { AdminLayout } from "@/components/admin/AdminLayout"
import { PermissionProvider } from "@/hooks/usePermissions"
import { RefineProvider } from "@/components/admin/RefineProvider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RefineProvider>
      <PermissionProvider>
        <AdminLayout>{children}</AdminLayout>
      </PermissionProvider>
    </RefineProvider>
  )
}
