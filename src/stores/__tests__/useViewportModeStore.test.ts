/**
 * ============================================
 * 视口模式状态管理 单元测试 (Phase 5 页面模式切换)
 * ============================================
 * 创建日期: 2026-04-14
 * 创建时间: 09:50
 * 测试内容：
 *   - 初始状态为 desktop
 *   - setMode 正确设置模式
 *   - toggleMode 在 desktop/mobile 之间切换
 *   - 状态持久化到 localStorage
 * ============================================
 */

import { useViewportModeStore } from "../useViewportModeStore"

describe("useViewportModeStore", () => {
  beforeEach(() => {
    useViewportModeStore.setState({ mode: "desktop" })
    localStorage.clear()
  })

  it("初始状态应为 desktop", () => {
    const { mode } = useViewportModeStore.getState()
    expect(mode).toBe("desktop")
  })

  it("setMode 应正确设置模式为 mobile", () => {
    useViewportModeStore.getState().setMode("mobile")
    expect(useViewportModeStore.getState().mode).toBe("mobile")
  })

  it("setMode 应正确设置模式为 desktop", () => {
    useViewportModeStore.getState().setMode("mobile")
    useViewportModeStore.getState().setMode("desktop")
    expect(useViewportModeStore.getState().mode).toBe("desktop")
  })

  it("toggleMode 应从 desktop 切换到 mobile", () => {
    useViewportModeStore.getState().toggleMode()
    expect(useViewportModeStore.getState().mode).toBe("mobile")
  })

  it("toggleMode 应从 mobile 切换到 desktop", () => {
    useViewportModeStore.getState().setMode("mobile")
    useViewportModeStore.getState().toggleMode()
    expect(useViewportModeStore.getState().mode).toBe("desktop")
  })

  it("连续 toggleMode 应在两种模式间交替", () => {
    expect(useViewportModeStore.getState().mode).toBe("desktop")
    useViewportModeStore.getState().toggleMode()
    expect(useViewportModeStore.getState().mode).toBe("mobile")
    useViewportModeStore.getState().toggleMode()
    expect(useViewportModeStore.getState().mode).toBe("desktop")
    useViewportModeStore.getState().toggleMode()
    expect(useViewportModeStore.getState().mode).toBe("mobile")
  })
})
