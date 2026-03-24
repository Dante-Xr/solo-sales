/**
 * ============================================
 * 管理后台响应式布局组件 (v0.4.1)
 * ============================================
 * 功能说明：
 *   - PC 端：固定左侧边栏 + 右侧内容区
 *   - 移动端：顶部导航栏 + 可折叠侧边栏
 *   - 响应式断点：1024px (lg)
 *   - 目标设备：iPhone 13 Pro Max (428px), Xiaomi 14 Ultra (393px)
 * ============================================
 */

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  BookOpen,
  Users,
  ShoppingCart,
  Upload,
  MessageSquare,
  Settings,
  Menu,
  X,
  UserCog,
  Shield,
  Key,
} from "lucide-react"

/**
 * 导航菜单项配置
 */
const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "控制台" },
  { href: "/admin/products", icon: Package, label: "商品管理" },
  { href: "/admin/knowledge", icon: BookOpen, label: "知识库" },
  { href: "/admin/customers", icon: Users, label: "客户管理" },
  { href: "/admin/orders", icon: ShoppingCart, label: "订单管理" },
  { href: "/admin/import", icon: Upload, label: "导入管理" },
  { href: "/admin/chat", icon: MessageSquare, label: "客服会话" },
  { href: "/admin/settings", icon: Settings, label: "设置" },
]

/**
 * 系统管理菜单项
 */
const SYSTEM_ITEMS = [
  { href: "/admin/users", icon: UserCog, label: "用户管理" },
  { href: "/admin/roles", icon: Shield, label: "角色管理" },
  { href: "/admin/permissions", icon: Key, label: "权限管理" },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // 关闭侧边栏
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-muted/50">
      {/* 移动端顶部栏 */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b z-40 flex items-center justify-between px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-md hover:bg-muted active:bg-muted/80"
            aria-label="打开菜单"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-base">SoloSales</span>
          <div className="w-10" />
        </header>
      )}

      {/* 移动端侧边栏 Overlay */}
      {isMobile && sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={closeSidebar}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-background z-50 transform transition-transform duration-200 ease-out animate-in slide-in-from-left duration-200">
            <div className="h-14 border-b flex items-center justify-between px-4">
              <span className="font-semibold">SoloSales</span>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-md hover:bg-muted"
                aria-label="关闭菜单"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-2 overflow-y-auto h-[calc(100vh-56px)]">
              <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">管理后台</div>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted active:bg-muted/80"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
              <div className="mt-4 mb-2 px-2 text-xs font-medium text-muted-foreground">系统管理</div>
              {SYSTEM_ITEMS.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted active:bg-muted/80"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </aside>
        </>
      )}

      {/* PC 端侧边栏 */}
      {!isMobile && (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r z-30">
          <div className="h-16 border-b flex items-center px-6">
            <span className="font-semibold text-lg">SoloSales</span>
          </div>
          <nav className="p-3 overflow-y-auto h-[calc(100vh-64px)]">
            <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">管理后台</div>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
            <div className="mt-4 mb-2 px-2 text-xs font-medium text-muted-foreground">系统管理</div>
            {SYSTEM_ITEMS.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>
      )}

      {/* 主内容区 */}
      <main
        className={cn(
          "min-h-screen transition-all duration-200",
          isMobile ? "pt-14" : "lg:pl-64"
        )}
      >
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}
