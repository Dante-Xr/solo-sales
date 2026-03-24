/**
 * 2026-03-23: 管理后台侧边栏导航组件 AppSidebar
 * 作用：作为后台系统的全局导航菜单，提供对各功能模块的快速访问入口
 * 逻辑：
 *   1. 使用 Shadcn Sidebar 系列组件构建可折叠侧边栏
 *   2. 预置导航项：控制台、商品管理、订单管理、客户管理、知识库、导入管理、客服会话、设置
 *   3. 系统管理分组：用户管理、角色管理、权限管理
 *   4. 每个菜单项通过 render 属性传入自定义 <a> 标签以支持 Next.js App Router 的客户端导航
 */
"use client"

import { Calendar, Home, Inbox, Settings, Package, ShoppingCart, Users, MessageSquare, Shield, UserCog, Key, BookOpen, Upload } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

/**
 * 2026-03-23: 导航菜单配置数组
 * 作用：集中管理菜单项的标题、跳转路径和图标，便于维护和扩展
 * 字段说明：
 *   - title: 显示的菜单名称
 *   - url: Next.js 客户端导航的目标路径
 *   - icon: 对应的 Lucide 图标组件
 */
const mainItems = [
  {
    title: "控制台",
    url: "/admin",
    icon: Home,
  },
  {
    title: "商品管理",
    url: "/admin/products",
    icon: Package,
  },
  {
    title: "知识库",
    url: "/admin/knowledge",
    icon: BookOpen,
  },
  {
    title: "客户管理",
    url: "/admin/customers",
    icon: Users,
  },
  {
    title: "订单管理",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "导入管理",
    url: "/admin/import",
    icon: Upload,
  },
  {
    title: "客服会话",
    url: "/admin/chat",
    icon: MessageSquare,
  },
  {
    title: "设置",
    url: "/admin/settings",
    icon: Settings,
  },
]

/**
 * 系统管理菜单分组
 */
const systemItems = [
  {
    title: "用户管理",
    url: "/admin/users",
    icon: UserCog,
  },
  {
    title: "角色管理",
    url: "/admin/roles",
    icon: Shield,
  },
  {
    title: "权限管理",
    url: "/admin/permissions",
    icon: Key,
  },
]

/**
 * 2026-03-23: 侧边栏导航组件主函数
 * 渲染逻辑：
 *   1. 最外层 Sidebar 组件包裹整个导航区
 *   2. SidebarGroup 划分"管理后台"导航区块
 *   3. SidebarMenu 渲染菜单列表，通过 map 生成每个菜单项
 *   4. SidebarMenuButton 使用 render 属性传入自定义节点，支持 Next.js 客户端导航
 */
export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>管理后台</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  } />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>系统管理</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  } />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
