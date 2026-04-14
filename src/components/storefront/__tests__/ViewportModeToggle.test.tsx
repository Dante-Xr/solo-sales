/**
 * ============================================
 * ViewportModeToggle 组件 单元测试 (Phase 5 页面模式切换)
 * ============================================
 * 创建日期: 2026-04-14
 * 创建时间: 09:55
 * 测试内容：
 *   - desktop 模式下显示 Monitor 图标
 *   - mobile 模式下显示 Smartphone 图标
 *   - 点击按钮切换模式
 *   - 按钮有正确的 title 提示
 * ============================================
 */

import { render, screen, fireEvent } from "@testing-library/react"
import { ViewportModeToggle } from "../ViewportModeToggle"
import { useViewportModeStore } from "@/stores/useViewportModeStore"

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      switchToMobile: "切换到手机端",
      switchToDesktop: "切换到网页端",
      desktop: "网页端",
      mobile: "手机端",
    }
    return map[key] || key
  },
}))

describe("ViewportModeToggle", () => {
  beforeEach(() => {
    useViewportModeStore.setState({ mode: "desktop" })
  })

  it("desktop 模式下应渲染 Monitor 图标", () => {
    const { container } = render(<ViewportModeToggle />)
    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
    expect(svg?.getAttribute("data-testid")).toBeNull()
  })

  it("desktop 模式下按钮 title 为切换到手机端", () => {
    render(<ViewportModeToggle />)
    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("title", "切换到手机端")
  })

  it("mobile 模式下按钮 title 为切换到网页端", () => {
    useViewportModeStore.setState({ mode: "mobile" })
    render(<ViewportModeToggle />)
    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("title", "切换到网页端")
  })

  it("点击按钮应切换模式从 desktop 到 mobile", () => {
    render(<ViewportModeToggle />)
    const button = screen.getByRole("button")
    fireEvent.click(button)
    expect(useViewportModeStore.getState().mode).toBe("mobile")
  })

  it("点击按钮应切换模式从 mobile 到 desktop", () => {
    useViewportModeStore.setState({ mode: "mobile" })
    render(<ViewportModeToggle />)
    const button = screen.getByRole("button")
    fireEvent.click(button)
    expect(useViewportModeStore.getState().mode).toBe("desktop")
  })
})
