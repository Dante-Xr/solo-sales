/**
 * Task 5: 订单确认页 - 单元测试
 */

import { render, screen } from "@testing-library/react"
import OrderConfirmationPage from "../page"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: jest.fn(),
    },
  },
}))

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn(() =>
    Promise.resolve((key: string) => {
      const map: Record<string, string> = {
        "orderConfirmed": "订单确认",
        "orderNumber": "订单号",
        "orderSummary": "订单摘要",
        "total": "总计",
        "status": "订单状态",
        "shipping": "配送信息",
        "estimatedDelivery": "预计送达",
        "pending": "待处理",
        "continueShopping": "继续购物",
        "viewOrders": "查看订单",
      }
      return map[key] || key
    })
  ),
}))

jest.mock("@/server/auth/session", () => ({
  getServerSessionUser: jest.fn(),
}))

jest.mock("@/server/services/order-service", () => ({
  getOrderByIdForViewer: jest.fn(),
}))

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NOT_FOUND")
  }),
}))

jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getServerSessionUser } from "@/server/auth/session"
import { getOrderByIdForViewer } from "@/server/services/order-service"
import { notFound as orderNotFound } from "@/server/contracts/errors"

describe("OrderConfirmationPage", () => {
  const mockOrder = {
    id: "order-123",
    totalAmount: 99.99,
    status: "PENDING",
    shippingAddress: "北京市朝阳区测试路 123 号",
    createdAt: new Date("2026-04-21"),
    items: [
      {
        id: "item-1",
        quantity: 2,
        price: 29.99,
        product: { name: "无线蓝牙耳机 Pro" },
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getServerSessionUser as jest.Mock).mockResolvedValue({ id: "user-1", role: "user" })
    ;(getOrderByIdForViewer as jest.Mock).mockResolvedValue(mockOrder)
  })

  it("应该通过带 viewer 权限校验的订单服务读取订单", async () => {
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

    const params = Promise.resolve({ id: "order-123", locale: "zh" })
    const Page = await OrderConfirmationPage({ params })
    render(Page)

    expect(getServerSessionUser).toHaveBeenCalled()
    expect(getOrderByIdForViewer).toHaveBeenCalledWith("order-123", { id: "user-1", role: "user" })
  })

  it("应该渲染订单确认信息", async () => {
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

    const params = Promise.resolve({ id: "order-123", locale: "zh" })
    const Page = await OrderConfirmationPage({ params })
    render(Page)

    expect(screen.getByText("订单确认")).toBeInTheDocument()
    expect(screen.getByText(/order-123/)).toBeInTheDocument()
  })

  it("应该渲染订单商品列表", async () => {
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

    const params = Promise.resolve({ id: "order-123", locale: "zh" })
    const Page = await OrderConfirmationPage({ params })
    render(Page)

    expect(screen.getByText(/无线蓝牙耳机 Pro/)).toBeInTheDocument()
  })

  it("应该渲染订单总计", async () => {
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

    const params = Promise.resolve({ id: "order-123", locale: "zh" })
    const Page = await OrderConfirmationPage({ params })
    render(Page)

    expect(screen.getByText(/99.99/)).toBeInTheDocument()
  })

  it("应该渲染操作按钮", async () => {
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

    const params = Promise.resolve({ id: "order-123", locale: "zh" })
    const Page = await OrderConfirmationPage({ params })
    render(Page)

    expect(screen.getByText("继续购物")).toBeInTheDocument()
    expect(screen.getByText("查看订单")).toBeInTheDocument()
  })

  it("订单不存在时应该调用 notFound", async () => {
    ;(getOrderByIdForViewer as jest.Mock).mockRejectedValue(orderNotFound("订单"))

    const params = Promise.resolve({ id: "invalid-id", locale: "zh" })
    await expect(OrderConfirmationPage({ params })).rejects.toThrow("NOT_FOUND")
    expect(notFound).toHaveBeenCalled()
  })
})
