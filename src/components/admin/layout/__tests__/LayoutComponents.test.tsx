/**
 * ============================================
 * 布局组件 单元测试 (Phase 3 界面优化)
 * ============================================
 * 测试覆盖：
 *   - Breadcrumb 面包屑导航渲染
 *   - FavoriteButton 收藏按钮交互
 *   - FavoritesList 收藏列表显示
 *   - RecentVisits 最近访问显示
 * ============================================
 */

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import { useAdminUIStore } from "@/stores/useAdminUIStore"

// ==================== Mock i18n ====================

const translations: Record<string, string> = {
  "dashboard": "Dashboard",
  "products.pageTitle": "Product Management",
  "orders": "Orders",
  "customers.pageTitle": "Customer Management",
  "settings": "Settings",
  "userManagement": "User Management",
  "profileLabel": "Profile",
  "tabs.close": "Close Tab",
  "tabs.refresh": "Refresh Tab",
  "tabs.closeOthers": "Close Others",
  "tabs.closeRight": "Close Right",
  "search.placeholder": "Search...",
  "search.hint": "Type to search",
  "search.noResults": "No results found",
  "search.pages": "Pages",
  "search.products": "Products",
  "favorites.title": "Favorites",
  "favorites.add": "Add to Favorites",
  "favorites.remove": "Remove",
  "recentVisits.title": "Recent Visits",
  "recentVisits.clear": "Clear History",
  "adminPanel": "Admin Panel",
  "systemManagement": "System Management",
  "shopName": "SoloSales Shop",
  "openMenu": "Open Menu",
  "closeMenu": "Close Menu",
  "userMenu": "User Menu",
  "switchLanguage": "Switch Language",
  "switchTheme": "Switch Theme",
  "role": "Role",
  "logout": "Logout",
  "fetchingAdminInfoFailed": "Failed to fetch admin info",
  "logoutFailed": "Logout failed",
  "chat": "Chat",
  "import": "Import",
  "knowledge.pageTitle": "Knowledge Base",
  "roleManagement": "Role Management",
  "permissionManagement": "Permission Management",
}

const mockT = (key: string) => translations[key] || key

jest.mock("next-intl", () => ({
  useTranslations: () => mockT,
  useLocale: () => "en",
}))

// ==================== Mock next/navigation ====================

const mockUsePathname = jest.fn(() => "/en/admin/products")

jest.mock("@/i18n/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  Link: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// ==================== 导入被测试模块 ====================

import { Breadcrumb } from "../Breadcrumb"
import { FavoriteButton } from "../FavoriteButton"
import { FavoritesList } from "../FavoritesList"
import { RecentVisits } from "../RecentVisits"

// ==================== Breadcrumb 测试 ====================

describe("Breadcrumb", () => {
  it("应渲染首页图标链接", () => {
    render(<Breadcrumb />)
    const links = screen.getAllByRole("link")
    expect(links.length).toBeGreaterThan(0)
  })

  it("应在 /admin 路径时不渲染（仪表盘）", () => {
    mockUsePathname.mockReturnValue("/en/admin")
    const { container } = render(<Breadcrumb />)
    expect(container.firstChild).toBeNull()
  })

  it("应显示当前页面名称作为最后一项", () => {
    mockUsePathname.mockReturnValue("/en/admin/products")
    render(<Breadcrumb />)
    expect(screen.getByText("Product Management")).toBeInTheDocument()
  })
})

// ==================== FavoriteButton 测试 ====================

describe("FavoriteButton", () => {
  const testTab = { id: "products", href: "/admin/products", label: "products.pageTitle" }

  beforeEach(() => {
    useAdminUIStore.setState({ favorites: [] })
  })

  it("应渲染收藏按钮", () => {
    render(<FavoriteButton tab={testTab} />)
    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  it("未收藏时应显示提示文字", () => {
    render(<FavoriteButton tab={testTab} />)
    const button = screen.getByRole("button")
    expect(button.title).toBe("Add to Favorites")
  })

  it("已收藏时应显示提示文字", () => {
    useAdminUIStore.setState({ favorites: [testTab] })
    render(<FavoriteButton tab={testTab} />)
    expect(screen.getByRole("button").title).toBe("Remove")
  })
})

// ==================== FavoritesList 测试 ====================

describe("FavoritesList", () => {
  beforeEach(() => {
    useAdminUIStore.setState({ favorites: [] })
  })

  it("无收藏时应返回 null（不渲染）", () => {
    const { container } = render(<FavoritesList />)
    expect(container.firstChild).toBeNull()
  })

  it("有收藏时应显示收藏列表", () => {
    useAdminUIStore.setState({
      favorites: [
        { id: "products", href: "/admin/products", label: "products.pageTitle" },
        { id: "orders", href: "/admin/orders", label: "orders" },
      ],
    })
    render(<FavoritesList />)
    expect(screen.getByText("Favorites")).toBeInTheDocument()
    expect(screen.getByText("Product Management")).toBeInTheDocument()
    expect(screen.getByText("Orders")).toBeInTheDocument()
  })

  it("应包含跳转链接", () => {
    useAdminUIStore.setState({
      favorites: [{ id: "products", href: "/admin/products", label: "products.pageTitle" }],
    })
    render(<FavoritesList />)
    const link = screen.getByText("Product Management").closest("a")
    expect(link).toHaveAttribute("href", "/admin/products")
  })
})

// ==================== RecentVisits 测试 ====================

describe("RecentVisits", () => {
  beforeEach(() => {
    useAdminUIStore.setState({ recentVisits: [] })
  })

  it("无访问记录时应返回 null", () => {
    const { container } = render(<RecentVisits />)
    expect(container.firstChild).toBeNull()
  })

  it("有访问记录时应显示列表", () => {
    useAdminUIStore.setState({
      recentVisits: [
        { id: "products", href: "/admin/products", label: "products.pageTitle" },
        { id: "orders", href: "/admin/orders", label: "orders" },
      ],
    })
    render(<RecentVisits />)
    expect(screen.getByText("Recent Visits")).toBeInTheDocument()
    expect(screen.getByText("Product Management")).toBeInTheDocument()
  })

  it("应显示清空按钮", () => {
    useAdminUIStore.setState({
      recentVisits: [{ id: "products", href: "/admin/products", label: "products.pageTitle" }],
    })
    render(<RecentVisits />)
    expect(screen.getByTitle("Clear History")).toBeInTheDocument()
  })
})
