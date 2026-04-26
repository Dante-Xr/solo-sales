/**
 * ============================================
 * ViewportWrapper 组件 单元测试 (Phase 5 页面模式切换)
 * ============================================
 * 测试内容：
 *   - desktop 模式下直接渲染子组件
 *   - mobile 模式下添加手机端容器
 *   - mobile 容器包含 data-viewport="mobile" 属性
 * ============================================
 */

import { render, screen } from "@testing-library/react"
import { ViewportWrapper } from "../ViewportWrapper"
import { useViewportModeStore } from "@/stores/useViewportModeStore"

describe("ViewportWrapper", () => {
  beforeEach(() => {
    useViewportModeStore.setState({ mode: "desktop" })
  })

  it("desktop 模式下应直接渲染子组件", () => {
    const { container } = render(
      <ViewportWrapper>
        <div data-testid="child">测试内容</div>
      </ViewportWrapper>
    )
    expect(screen.getByTestId("child")).toBeInTheDocument()
    expect(container.querySelector('[data-viewport="mobile"]')).toBeNull()
  })

  it("mobile 模式下应渲染手机端容器", () => {
    useViewportModeStore.setState({ mode: "mobile" })
    const { container } = render(
      <ViewportWrapper>
        <div data-testid="child">测试内容</div>
      </ViewportWrapper>
    )
    expect(screen.getByTestId("child")).toBeInTheDocument()
    expect(container.querySelector('[data-viewport="mobile"]')).toBeInTheDocument()
  })

  it("mobile 模式下子组件应在手机端容器内", () => {
    useViewportModeStore.setState({ mode: "mobile" })
    render(
      <ViewportWrapper>
        <div data-testid="child">测试内容</div>
      </ViewportWrapper>
    )
    const child = screen.getByTestId("child")
    const mobileContainer = child.closest('[data-viewport="mobile"]')
    expect(mobileContainer).toBeInTheDocument()
  })
})
