/**
 * ============================================
 * Refine 配置组件 (Phase 5 管理后台重构)
 * ============================================
 * 创建日期: 2026-04-13
 * 创建时间: 22:10
 * 功能说明：
 *   - Refine 框架的根配置组件
 *   - 注册资源（products, orders, users, roles, permissions, customers, messages, import-logs, knowledge, knowledge-categories, profile）
 *   - 配置数据提供者和认证提供者
 *   - 配置 Next.js App Router 路由
 * ============================================
 * 2026-04-13 23:55: 添加新资源（messages, import-logs, knowledge, knowledge-categories, profile）
 */

"use client"

import { Refine } from "@refinedev/core"
import { useTranslations } from "next-intl"
import { dataProvider } from "@/lib/refine-data-provider"
import { authProvider } from "@/lib/refine-auth-provider"

export function RefineProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin")

  return (
    <Refine
      dataProvider={dataProvider}
      authProvider={authProvider}
      resources={[
        {
          name: "products",
          list: "/admin/products",
          create: "/admin/products/create",
          edit: "/admin/products/edit/:id",
          meta: {
            label: t("productManagement"),
          },
        },
        {
          name: "orders",
          list: "/admin/orders",
          edit: "/admin/orders/edit/:id",
          meta: {
            label: t("orderManagement"),
          },
        },
        {
          name: "users",
          list: "/admin/users",
          create: "/admin/users/create",
          edit: "/admin/users/edit/:id",
          meta: {
            label: t("activeUsers"),
          },
        },
        {
          name: "roles",
          list: "/admin/roles",
          create: "/admin/roles/create",
          edit: "/admin/roles/edit/:id",
          meta: {
            label: t("roleManagement"),
          },
        },
        {
          name: "permissions",
          list: "/admin/permissions",
          create: "/admin/permissions/create",
          edit: "/admin/permissions/edit/:id",
          meta: {
            label: t("permissionManagement"),
          },
        },
        {
          name: "customers",
          list: "/admin/customers",
          meta: {
            label: t("customer"),
          },
        },
        {
          name: "messages",
          list: "/admin/chat",
          meta: {
            label: t("chatLabel"),
          },
        },
        {
          name: "import-logs",
          list: "/admin/import",
          meta: {
            label: t("importLabel"),
          },
        },
        {
          name: "knowledge",
          list: "/admin/knowledge",
          create: "/admin/knowledge/create",
          edit: "/admin/knowledge/edit/:id",
          meta: {
            label: t("knowledgeLabel"),
          },
        },
        {
          name: "knowledge-categories",
          meta: {
            label: t("knowledgeCategories"),
          },
        },
        {
          name: "profile",
          meta: {
            label: t("profileLabel"),
          },
        },
        {
          name: "dashboard",
          list: "/admin",
          meta: {
            label: t("dashboard"),
          },
        },
      ]}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
      }}
    >
      {children}
    </Refine>
  )
}
