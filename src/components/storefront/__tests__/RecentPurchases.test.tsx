/**
 * Task 9: 紧迫感元素 - RecentPurchases 单元测试
 */

import { render, screen, act, fireEvent } from "@testing-library/react"
import { RecentPurchases } from "../RecentPurchases"

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    if (key === "recentPurchase") {
      return `${params?.region} 的用户刚购买了 ${params?.product}`
    }
    if (key === "justNow") return "刚刚"
    return key
  },
}))

describe("RecentPurchases", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("初始状态不应该显示通知", () => {
    render(<RecentPurchases />)

    const notification = screen.queryByText(/的用户刚购买了/)
    expect(notification).not.toBeInTheDocument()
  })

  it("3秒后应该显示购买通知", () => {
    render(<RecentPurchases />)

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    const notification = screen.getByText(/的用户刚购买了/)
    expect(notification).toBeInTheDocument()
  })

  it("点击关闭后应该隐藏通知", () => {
    render(<RecentPurchases />)

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    const closeButton = screen.getByRole("button")
    fireEvent.click(closeButton)

    const notification = screen.queryByText(/的用户刚购买了/)
    expect(notification).not.toBeInTheDocument()
  })

  it("关闭后不应该再显示新通知", () => {
    render(<RecentPurchases />)

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    const closeButton = screen.getByRole("button")
    fireEvent.click(closeButton)

    act(() => {
      jest.advanceTimersByTime(10000)
    })

    const notification = screen.queryByText(/的用户刚购买了/)
    expect(notification).not.toBeInTheDocument()
  })
})
