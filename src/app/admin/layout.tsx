/**
 * 2026-03-23: 管理后台根布局组件 AdminLayout
 * 作用：定义管理后台所有页面的统一布局结构
 * 逻辑：
 *   1. 使用 SidebarProvider 提供侧边栏上下文，使子页面能够控制侧边栏展开/收起
 *   2. 顶部 Header 包含侧边栏触发器（SidebarTrigger）和系统名称标题
 *   3. 主体内容区通过 {children} 插槽动态渲染各子页面内容（控制台、商品、订单等）
 */
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin/app-sidebar"

/**
 * 2026-03-23: 管理后台布局组件
 * @param children - 各子页面（如 /admin、/admin/products）的内容
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      {/* 左侧可折叠侧边栏导航 */}
      <AppSidebar />
      {/* 右侧主内容区：顶部 Header + 可滚动的页面内容 */}
      <main className="w-full h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        {/* 顶部固定导航栏，包含菜单展开/收起触发器和系统标题 */}
        <header className="flex h-16 items-center border-b px-4 bg-white dark:bg-zinc-900 shadow-sm shrink-0">
          <SidebarTrigger />
          <h1 className="ml-4 text-lg font-semibold">SoloSales 后台管理系统</h1>
        </header>
        {/* 页面内容区，支持内部滚动 */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
